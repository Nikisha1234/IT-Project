
package com.rentequip.rentequip_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.rentequip.rentequip_backend.entity.Notification;
import com.rentequip.rentequip_backend.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository
    ) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(
            String recipientEmail,
            String title,
            String message,
            Long rentalId
    ) {
        Notification notification = new Notification(
                recipientEmail,
                title,
                message,
                rentalId
        );

        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(
            String email
    ) {
        return notificationRepository
                .findByRecipientEmailOrderByCreatedAtDesc(email);
    }

    public Notification markAsRead(Long id) {

        Notification notification = notificationRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Notification not found"
                        )
                );

        notification.setRead(true);

        return notificationRepository.save(notification);
    }
}
