package com.rentequip.rentequip_backend.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.rentequip.rentequip_backend.entity.Equipment;
import com.rentequip.rentequip_backend.entity.Rental;
import com.rentequip.rentequip_backend.entity.User;
import com.rentequip.rentequip_backend.repository.EquipmentRepository;
import com.rentequip.rentequip_backend.repository.RentalRepository;
import com.rentequip.rentequip_backend.repository.UserRepository;

@Service
public class RentalService {

    private final RentalRepository rentalRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public RentalService(
            RentalRepository rentalRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.rentalRepository = rentalRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Rental createRental(Rental rental) {

        if (rental.getCustomerEmail() == null ||
                rental.getCustomerEmail().trim().isEmpty()) {
            throw new RuntimeException("Customer email is required");
        }

        if (rental.getEquipmentId() == null) {
            throw new RuntimeException("Equipment ID is required");
        }

        String customerEmail =
                rental.getCustomerEmail().trim().toLowerCase();

        User customer = userRepository
                .findByEmailIgnoreCase(customerEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (!customer.isCitizenshipProvided()) {
            throw new RuntimeException(
                    "Citizenship verification is required before renting equipment."
            );
        }

        Equipment equipment = equipmentRepository
                .findById(rental.getEquipmentId())
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        if (!equipment.isAvailable()) {
            throw new RuntimeException(
                    "This equipment is currently unavailable");
        }

        if (rental.getStartDate() == null ||
                rental.getEndDate() == null) {
            throw new RuntimeException(
                    "Start date and end date are required");
        }

        if (rental.getEndDate().isBefore(rental.getStartDate())) {
            throw new RuntimeException(
                    "End date cannot be before start date");
        }

        long days = ChronoUnit.DAYS.between(
                rental.getStartDate(),
                rental.getEndDate()
        ) + 1;

        if (days <= 0) {
            throw new RuntimeException(
                    "Rental period must be at least one day");
        }

        if (equipment.getOwnerEmail() == null ||
                equipment.getOwnerEmail().trim().isEmpty()) {
            throw new RuntimeException(
                    "This equipment does not have an owner assigned");
        }

        String ownerEmail =
                equipment.getOwnerEmail().trim().toLowerCase();

        if (ownerEmail.equals(customerEmail)) {
            throw new RuntimeException(
                    "You cannot rent your own equipment");
        }

        double equipmentPrice = equipment.getPrice();
        double rentalFee = equipmentPrice * days;
        double deposit = equipment.getSecurityDeposit();
        double totalAmount = rentalFee + deposit;

        rental.setCustomerEmail(customerEmail);
        rental.setOwnerEmail(ownerEmail);
        rental.setTotalDays((int) days);
        rental.setRentalFee(rentalFee);
        rental.setSecurityDeposit(deposit);
        rental.setTotalAmount(totalAmount);

        rental.setStatus("PENDING");
        rental.setPaymentStatus("NOT_STARTED");
        rental.setSecurityDepositStatus("NOT_HELD");
        rental.setTermsAccepted(false);

        Rental savedRental = rentalRepository.save(rental);

        notificationService.createNotification(
                ownerEmail,
                equipment.getName() + " Rental Request",
                "You have received a rental request for " +
                        equipment.getName() +
                        " from " +
                        rental.getStartDate() +
                        " to " +
                        rental.getEndDate() +
                        ".",
                savedRental.getId()
        );

        return savedRental;
    }

    public Rental getRentalById(Long id) {
        return rentalRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Rental not found"));
    }

    public List<Rental> getRentalsByCustomerEmail(String email) {

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Customer email is required");
        }

        return rentalRepository.findByCustomerEmailIgnoreCase(
                email.trim()
        );
    }

    public List<Rental> getRentalsByOwnerEmail(String email) {

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Owner email is required");
        }

        return rentalRepository.findByOwnerEmailIgnoreCase(
                email.trim()
        );
    }

    public Rental acceptRental(Long id) {

        Rental rental = getRentalById(id);

        if (!"PENDING".equals(rental.getStatus())) {
            throw new RuntimeException(
                    "Only pending rental requests can be accepted");
        }

        Equipment equipment = equipmentRepository
                .findById(rental.getEquipmentId())
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        if (!equipment.isAvailable()) {
            throw new RuntimeException(
                    "This equipment is no longer available");
        }

        List<Rental> otherRequests =
                rentalRepository.findByEquipmentId(
                        rental.getEquipmentId()
                );

        for (Rental other : otherRequests) {

            if (!other.getId().equals(rental.getId()) &&
                    "PENDING".equals(other.getStatus())) {

                other.setStatus("CANCELLED");
                other.setPaymentStatus("CANCELLED");

                rentalRepository.save(other);

                notificationService.createNotification(
                        other.getCustomerEmail(),
                        equipment.getName() + " Rental Request Cancelled",
                        "Another rental request for " +
                                equipment.getName() +
                                " was accepted.",
                        other.getId()
                );
            }
        }

        rental.setStatus("PAYMENT_PENDING");
        rental.setPaymentStatus("PENDING");

        Rental savedRental = rentalRepository.save(rental);

        notificationService.createNotification(
                rental.getCustomerEmail(),
                equipment.getName() + " Rental Request Accepted",
                "Your rental request for " +
                        equipment.getName() +
                        " was accepted. Please complete the payment.",
                savedRental.getId()
        );

        return savedRental;
    }

    public Rental rejectRental(Long id) {

        Rental rental = getRentalById(id);

        if (!"PENDING".equals(rental.getStatus())) {
            throw new RuntimeException(
                    "Only pending rental requests can be rejected");
        }

        Equipment equipment = equipmentRepository
                .findById(rental.getEquipmentId())
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        rental.setStatus("CANCELLED");
        rental.setPaymentStatus("CANCELLED");

        Rental savedRental = rentalRepository.save(rental);

        notificationService.createNotification(
                rental.getCustomerEmail(),
                equipment.getName() + " Rental Request Rejected",
                "Your rental request for " +
                        equipment.getName() +
                        " has been rejected by the owner.",
                savedRental.getId()
        );

        return savedRental;
    }

    public Rental completeOnlinePayment(
            Long id,
            boolean termsAccepted
    ) {

        Rental rental = getRentalById(id);

        if (!"PAYMENT_PENDING".equals(rental.getStatus())) {
            throw new RuntimeException(
                    "Online payment is not currently available for this rental");
        }

        if (!termsAccepted) {
            throw new RuntimeException(
                    "You must accept the rental agreement");
        }

        Equipment equipment = equipmentRepository
                .findById(rental.getEquipmentId())
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        if (!equipment.isAvailable()) {
            throw new RuntimeException(
                    "This equipment is no longer available");
        }

        rental.setTermsAccepted(true);
        rental.setTermsAcceptedAt(LocalDateTime.now());

        rental.setPaymentMethod("ONLINE");
        rental.setPaymentStatus("PAID");

        rental.setTransactionId(
                "TEST-" +
                        UUID.randomUUID()
                                .toString()
                                .substring(0, 8)
                                .toUpperCase()
        );

        rental.setPaymentDate(LocalDateTime.now());
        rental.setSecurityDepositStatus("HELD");
        rental.setStatus("ACTIVE");

        equipment.setAvailable(false);
        equipmentRepository.save(equipment);

        Rental savedRental = rentalRepository.save(rental);

        notificationService.createNotification(
                rental.getOwnerEmail(),
                equipment.getName() + " Payment Completed",
                "The customer has completed the test online payment for " +
                        equipment.getName() +
                        ". The rental is now active.",
                savedRental.getId()
        );

        return savedRental;
    }

    public Rental selectCashPayment(
            Long id,
            boolean termsAccepted
    ) {

        Rental rental = getRentalById(id);

        if (!"PAYMENT_PENDING".equals(rental.getStatus())) {
            throw new RuntimeException(
                    "Cash payment is not currently available for this rental");
        }

        if (!termsAccepted) {
            throw new RuntimeException(
                    "You must accept the rental agreement");
        }

        Equipment equipment = equipmentRepository
                .findById(rental.getEquipmentId())
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        rental.setTermsAccepted(true);
        rental.setTermsAcceptedAt(LocalDateTime.now());

        rental.setPaymentMethod("CASH");
        rental.setPaymentStatus("CASH_PENDING");

        rental.setSecurityDepositStatus("NOT_HELD");

        rental.setStatus("CASH_PENDING");

        Rental savedRental = rentalRepository.save(rental);

        notificationService.createNotification(
                rental.getOwnerEmail(),
                equipment.getName() + " Cash Payment Pending",
                "The customer selected Cash on Hand for " +
                        equipment.getName() +
                        ". Confirm the payment when the cash is received.",
                savedRental.getId()
        );

        return savedRental;
    }

    public Rental confirmCashPayment(Long id) {

        Rental rental = getRentalById(id);

        if (!"CASH_PENDING".equals(rental.getStatus())) {
            throw new RuntimeException(
                    "This rental is not waiting for cash confirmation");
        }

        if (!"CASH_PENDING".equals(rental.getPaymentStatus())) {
            throw new RuntimeException(
                    "This rental is not waiting for cash confirmation");
        }

        Equipment equipment = equipmentRepository
                .findById(rental.getEquipmentId())
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        if (!equipment.isAvailable()) {
            throw new RuntimeException(
                    "This equipment is no longer available");
        }

        rental.setPaymentMethod("CASH");
        rental.setPaymentStatus("PAID");

        rental.setTransactionId(
                "CASH-" +
                        UUID.randomUUID()
                                .toString()
                                .substring(0, 8)
                                .toUpperCase()
        );

        rental.setPaymentDate(LocalDateTime.now());
        rental.setSecurityDepositStatus("HELD");
        rental.setStatus("ACTIVE");

        equipment.setAvailable(false);
        equipmentRepository.save(equipment);

        Rental savedRental = rentalRepository.save(rental);

        notificationService.createNotification(
                rental.getCustomerEmail(),
                equipment.getName() + " Cash Payment Confirmed",
                "Your cash payment for " +
                        equipment.getName() +
                        " has been confirmed. Your rental is now active.",
                savedRental.getId()
        );

        return savedRental;
    }

    public Rental cancelPayment(Long id) {

        Rental rental = getRentalById(id);

        if (!"PAYMENT_PENDING".equals(rental.getStatus())) {
            throw new RuntimeException(
                    "This rental cannot be cancelled at this stage");
        }

        Equipment equipment = equipmentRepository
                .findById(rental.getEquipmentId())
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        rental.setStatus("CANCELLED");
        rental.setPaymentStatus("CANCELLED");

        Rental savedRental = rentalRepository.save(rental);

        notificationService.createNotification(
                rental.getOwnerEmail(),
                equipment.getName() + " Rental Cancelled",
                "The customer cancelled the pending payment for " +
                        equipment.getName() +
                        ".",
                savedRental.getId()
        );

        return savedRental;
    }

    public Rental requestReturn(Long id) {

        Rental rental = getRentalById(id);

        if (!"ACTIVE".equals(rental.getStatus())) {
            throw new RuntimeException(
                    "Only active rentals can request a return");
        }

        Equipment equipment = equipmentRepository
                .findById(rental.getEquipmentId())
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        rental.setStatus("RETURN_REQUESTED");

        Rental savedRental = rentalRepository.save(rental);

        notificationService.createNotification(
                rental.getOwnerEmail(),
                equipment.getName() + " Return Request",
                "The customer has requested to return " +
                        equipment.getName() +
                        ".",
                savedRental.getId()
        );

        return savedRental;
    }

    public Rental completeRental(Long id) {

        Rental rental = getRentalById(id);

        if (!"RETURN_REQUESTED".equals(rental.getStatus())) {
            throw new RuntimeException(
                    "Only return requests can be completed");
        }

        Equipment equipment = equipmentRepository
                .findById(rental.getEquipmentId())
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        rental.setStatus("COMPLETED");
        rental.setSecurityDepositStatus("REFUNDED");

        equipment.setAvailable(true);
        equipmentRepository.save(equipment);

        Rental savedRental = rentalRepository.save(rental);

        notificationService.createNotification(
                rental.getCustomerEmail(),
                equipment.getName() + " Rental Completed",
                "Your rental of " +
                        equipment.getName() +
                        " has been completed and your security deposit has been marked as refunded.",
                savedRental.getId()
        );

        return savedRental;
    }
}