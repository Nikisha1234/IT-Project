
package com.rentequip.rentequip_backend.service;

import com.rentequip.rentequip_backend.entity.Equipment;
import com.rentequip.rentequip_backend.entity.Rental;
import com.rentequip.rentequip_backend.entity.User;
import com.rentequip.rentequip_backend.repository.EquipmentRepository;
import com.rentequip.rentequip_backend.repository.RentalRepository;
import com.rentequip.rentequip_backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    private final RentalRepository rentalRepository;

    public AdminService(
            UserRepository userRepository,
            EquipmentRepository equipmentRepository,
            RentalRepository rentalRepository) {

        this.userRepository = userRepository;
        this.equipmentRepository = equipmentRepository;
        this.rentalRepository = rentalRepository;
    }

    // GET ALL USERS
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // DELETE USER
    public void deleteUser(Long id) {

        User user = userRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Prevent deleting the admin account
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException(
                    "The admin account cannot be deleted");
        }

        userRepository.deleteById(id);
    }

    // GET ALL EQUIPMENT
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    // DELETE EQUIPMENT
    public void deleteEquipment(Long id) {

        if (!equipmentRepository.existsById(id)) {
            throw new RuntimeException(
                    "Equipment not found");
        }

        equipmentRepository.deleteById(id);
    }

    // GET ALL RENTALS
    public List<Rental> getAllRentals() {
        return rentalRepository.findAll();
    }
}

