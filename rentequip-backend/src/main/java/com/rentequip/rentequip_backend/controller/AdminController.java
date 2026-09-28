package com.rentequip.rentequip_backend.controller;

import com.rentequip.rentequip_backend.entity.Equipment;
import com.rentequip.rentequip_backend.entity.Rental;
import com.rentequip.rentequip_backend.entity.User;
import com.rentequip.rentequip_backend.service.AdminService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // =========================
    // USERS
    // =========================

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return adminService.getAllUsers();
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
    }

    // =========================
    // EQUIPMENT
    // =========================

    @GetMapping("/equipment")
    public List<Equipment> getAllEquipment() {
        return adminService.getAllEquipment();
    }

    @DeleteMapping("/equipment/{id}")
    public void deleteEquipment(@PathVariable Long id) {
        adminService.deleteEquipment(id);
    }

    // =========================
    // RENTALS
    // =========================

    @GetMapping("/rentals")
    public List<Rental> getAllRentals() {
        return adminService.getAllRentals();
    }
}
