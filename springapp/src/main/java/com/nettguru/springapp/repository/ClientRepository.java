
package com.nettguru.springapp.repository;

import com.nettguru.springapp.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<Client> findByInvitationStatusIgnoreCase(String invitationStatus);

    List<Client> findByStatusIgnoreCase(String status);
}
