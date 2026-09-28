
package com.rentequip.rentequip_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rentequip.rentequip_backend.entity.Notification;
import com.rentequip.rentequip_backend.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService
    ) {
        this.notificationService = notificationService;
    }

    // Get notifications for a user
    @GetMapping
    public List<Notification> getNotifications(
            @RequestParam String email
    ) {
        return notificationService.getUserNotifications(email);
    }

    // Create a notification
    @PostMapping
    public Notification createNotification(
            @RequestBody NotificationRequest request
    ) {
        return notificationService.createNotification(
                request.getRecipientEmail(),
                request.getTitle(),
                request.getMessage(),
                request.getRentalId()
        );
    }

    // Mark notification as read
    @PutMapping("/{id}/read")
    public Notification markAsRead(
            @PathVariable Long id
    ) {
        return notificationService.markAsRead(id);
    }

    // Request body for creating a notification
    public static class NotificationRequest {

        private String recipientEmail;
        private String title;
        private String message;
        private Long rentalId;

        public NotificationRequest() {
        }

        public String getRecipientEmail() {
            return recipientEmail;
        }

        public void setRecipientEmail(String recipientEmail) {
            this.recipientEmail = recipientEmail;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public Long getRentalId() {
            return rentalId;
        }

        public void setRentalId(Long rentalId) {
            this.rentalId = rentalId;
        }
    }
}
