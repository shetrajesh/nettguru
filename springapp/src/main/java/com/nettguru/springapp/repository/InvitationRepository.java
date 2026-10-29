
package com.nettguru.springapp.repository;

import com.nettguru.springapp.entity.Invitation;
import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    List<Invitation> findByEmailIgnoreCase(String email);

    List<Invitation> findByInviteTypeIgnoreCase(String inviteType);

    List<Invitation> findByStatusIgnoreCase(String status);

    Optional<Invitation>
    findFirstByEmailIgnoreCaseAndInviteTypeIgnoreCaseAndStatusIgnoreCaseOrderByCreatedAtDesc(
            String email,
            String inviteType,
            String status
    );

    Optional<Invitation> findByToken(String token);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Invitation i WHERE i.token = :token")
    Optional<Invitation> findByTokenForUpdate(@Param("token") String token);
}
