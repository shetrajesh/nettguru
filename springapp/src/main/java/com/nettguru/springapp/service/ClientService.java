
package com.nettguru.springapp.service;

import com.nettguru.springapp.dto.ClientRequestDto;
import com.nettguru.springapp.dto.ClientResponseDto;
import com.nettguru.springapp.dto.InvitationRequest;
import com.nettguru.springapp.dto.InvitationResponse;
import com.nettguru.springapp.entity.AdminUser;
import com.nettguru.springapp.entity.Client;
import com.nettguru.springapp.repository.AdminUserRepository;
import com.nettguru.springapp.repository.ClientRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;
    private final AdminUserRepository adminUserRepository;
    private final InvitationService invitationService;

    public ClientService(
            ClientRepository clientRepository,
            AdminUserRepository adminUserRepository,
            InvitationService invitationService) {
        this.clientRepository = clientRepository;
        this.adminUserRepository = adminUserRepository;
        this.invitationService = invitationService;
    }

    // Create a client and send an invitation email
    public ClientResponseDto createClient(ClientRequestDto request) {

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (clientRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A client with this email already exists"
            );
        }

        Client client = new Client();

        client.setLegalName(request.getLegalName().trim());
        client.setDisplayName(request.getDisplayName().trim());
        client.setBusinessType(request.getBusinessType());
        client.setTimeZone(request.getTimeZone());
        client.setFirstName(request.getFirstName().trim());
        client.setLastName(request.getLastName().trim());
        client.setEmail(email);
        client.setMobileNumber(request.getMobileNumber().trim());
        client.setPrimaryAssociate(request.getPrimaryAssociate());
        client.setBackupAssociate(request.getBackupAssociate());
        client.setInvitationStatus("Pending");

        Client savedClient = clientRepository.save(client);

        InvitationRequest invitationRequest = new InvitationRequest();
        invitationRequest.setName(
                savedClient.getFirstName() + " " + savedClient.getLastName()
        );
        invitationRequest.setEmail(savedClient.getEmail());
        invitationRequest.setInviteType("CLIENT");
        invitationRequest.setInvitedBy("Admin");

        InvitationResponse invitation =
                invitationService.sendInvitation(invitationRequest);

        savedClient.setInvitationStatus(invitation.getStatus());
        savedClient = clientRepository.save(savedClient);

        return mapToResponse(savedClient);
    }

    // Get all clients
    @Transactional(readOnly = true)
    public List<ClientResponseDto> getAllClients() {
        return clientRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get a client by ID
    @Transactional(readOnly = true)
    public ClientResponseDto getClientById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Client not found with ID: " + id
                ));

        return mapToResponse(client);
    }

    // Update an existing client
    public ClientResponseDto updateClient(
            Long id, ClientRequestDto request) {

        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Client not found with ID: " + id
                ));

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        clientRepository.findByEmailIgnoreCase(email)
                .ifPresent(existingClient -> {
                    if (!existingClient.getId().equals(id)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "A client with this email already exists"
                        );
                    }
                });

        client.setLegalName(request.getLegalName().trim());
        client.setDisplayName(request.getDisplayName().trim());
        client.setBusinessType(request.getBusinessType());
        client.setTimeZone(request.getTimeZone());
        client.setFirstName(request.getFirstName().trim());
        client.setLastName(request.getLastName().trim());
        client.setEmail(email);
        client.setMobileNumber(request.getMobileNumber().trim());
        client.setPrimaryAssociate(request.getPrimaryAssociate());
        client.setBackupAssociate(request.getBackupAssociate());

        return mapToResponse(clientRepository.save(client));
    }

    // Convert entity to response DTO
    private ClientResponseDto mapToResponse(Client client) {
        return new ClientResponseDto(
                client.getId(),
                client.getLegalName(),
                client.getDisplayName(),
                client.getBusinessType(),
                client.getTimeZone(),
                client.getFirstName(),
                client.getLastName(),
                client.getEmail(),
                client.getMobileNumber(),
                client.getPrimaryAssociate(),
                client.getBackupAssociate(),
                client.getStage(),
                client.getStatus(),
                client.getDueDate(),
                client.getOpenItems(),
                client.getLastActivity(),
                client.getInvitationStatus(),
                client.getCreatedAt()
        );
    }

    // Permanently delete a client and its matching CLIENT login account.
    // Both deletions run in the same database transaction.
    public void deleteClient(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Client not found with ID: " + id
                ));

        String email = client.getEmail().trim().toLowerCase(Locale.ROOT);

        AdminUser clientAccount = adminUserRepository
                .findByEmailIgnoreCaseAndRoleIgnoreCase(email, "CLIENT")
                .orElse(null);

        // Delete only the account explicitly assigned the CLIENT role.
        // Never delete a TEAM or ADMIN account from client deletion.
        if (clientAccount != null) {
            adminUserRepository.delete(clientAccount);
            adminUserRepository.flush();
        }

        clientRepository.delete(client);
        clientRepository.flush();
    }
}
