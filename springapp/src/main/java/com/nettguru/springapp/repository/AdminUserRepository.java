
package com.nettguru.springapp.repository;

import com.nettguru.springapp.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

    Optional<AdminUser> findByEmailIgnoreCase(String email);

    Optional<AdminUser> findByEmailIgnoreCaseAndRoleIgnoreCase(
            String email,
            String role
    );

    boolean existsByEmailIgnoreCase(String email);
}
