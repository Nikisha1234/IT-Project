package com.rentequip.rentequip_backend.controller;

import com.rentequip.rentequip_backend.entity.Rental;
import com.rentequip.rentequip_backend.service.RentalService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@CrossOrigin
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @PostMapping
    public Rental createRental(@RequestBody Rental rental) {
        return rentalService.createRental(rental);
    }

    @GetMapping("/{id}")
    public Rental getRentalById(@PathVariable Long id) {
        return rentalService.getRentalById(id);
    }

    @GetMapping("/customer")
    public List<Rental> getCustomerRentals(
            @RequestParam String email
    ) {
        return rentalService.getRentalsByCustomerEmail(email);
    }

    @GetMapping("/owner")
    public List<Rental> getOwnerRentals(
            @RequestParam String email
    ) {
        return rentalService.getRentalsByOwnerEmail(email);
    }

    @PutMapping("/{id}/accept")
    public Rental acceptRental(@PathVariable Long id) {
        return rentalService.acceptRental(id);
    }

    @PutMapping("/{id}/reject")
    public Rental rejectRental(@PathVariable Long id) {
        return rentalService.rejectRental(id);
    }

    @PutMapping("/{id}/pay-online")
    public Rental payOnline(
            @PathVariable Long id,
            @RequestParam boolean termsAccepted
    ) {
        return rentalService.completeOnlinePayment(
                id,
                termsAccepted
        );
    }

    @PutMapping("/{id}/pay-cash")
    public Rental payCash(
            @PathVariable Long id,
            @RequestParam boolean termsAccepted
    ) {
        return rentalService.selectCashPayment(
                id,
                termsAccepted
        );
    }

    @PutMapping("/{id}/confirm-cash")
    public Rental confirmCash(@PathVariable Long id) {
        return rentalService.confirmCashPayment(id);
    }

    @PutMapping("/{id}/cancel-payment")
    public Rental cancelPayment(@PathVariable Long id) {
        return rentalService.cancelPayment(id);
    }

    @PutMapping("/{id}/return")
    public Rental requestReturn(@PathVariable Long id) {
        return rentalService.requestReturn(id);
    }

    @PutMapping("/{id}/complete")
    public Rental completeRental(@PathVariable Long id) {
        return rentalService.completeRental(id);
    }
}