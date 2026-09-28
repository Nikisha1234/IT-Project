package com.rentequip.rentequip_backend.repository;

import com.rentequip.rentequip_backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(
            String recipientEmail
    );
}