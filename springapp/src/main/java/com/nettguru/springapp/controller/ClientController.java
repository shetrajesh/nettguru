
package com.nettguru.springapp.controller;

import com.nettguru.springapp.dto.ClientRequestDto;
import com.nettguru.springapp.dto.ClientResponseDto;
import com.nettguru.springapp.service.ClientService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClientResponseDto createClient(
            @Valid @RequestBody ClientRequestDto request) {
        return clientService.createClient(request);
    }

    @GetMapping
    public List<ClientResponseDto> getAllClients() {
        return clientService.getAllClients();
    }

    @GetMapping("/{id}")
    public ClientResponseDto getClientById(@PathVariable Long id) {
        return clientService.getClientById(id);
    }

    @PutMapping("/{id}")
    public ClientResponseDto updateClient(
            @PathVariable Long id,
            @Valid @RequestBody ClientRequestDto request) {
        return clientService.updateClient(id, request);
    }

    // Permanently delete a client
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteClient(@PathVariable Long id) {
        clientService.deleteClient(id);
    }
}
