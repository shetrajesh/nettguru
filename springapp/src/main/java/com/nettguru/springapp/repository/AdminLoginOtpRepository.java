
package com.nettguru.springapp.repository;

import com.nettguru.springapp.entity.AdminLoginOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdminLoginOtpRepository
        extends JpaRepository<AdminLoginOtp, Long> {

    List<AdminLoginOtp> findByAdminUserIdAndUsedFalse(Long adminUserId);

    Optional<AdminLoginOtp> findTopByAdminUserIdAndUsedFalseOrderByCreatedAtDesc(
            Long adminUserId);
}
