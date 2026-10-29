package com.nettguru.springapp.repository;

import com.nettguru.springapp.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    Optional<TeamMember> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<TeamMember> findByInvitationStatusIgnoreCase(String invitationStatus);

    List<TeamMember> findByStatusIgnoreCase(String status);
}