package com.rentequip.rentequip_backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.rentequip.rentequip_backend.entity.Equipment;
import com.rentequip.rentequip_backend.entity.User;
import com.rentequip.rentequip_backend.repository.EquipmentRepository;
import com.rentequip.rentequip_backend.repository.UserRepository;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    public EquipmentService(
            EquipmentRepository equipmentRepository,
            UserRepository userRepository
    ) {
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
    }

    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    public Equipment getEquipmentById(Long id) {
        return equipmentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));
    }

    public List<Equipment> getEquipmentByOwnerEmail(String ownerEmail) {

        if (ownerEmail == null ||
                ownerEmail.trim().isEmpty()) {

            throw new RuntimeException("Owner email is required");
        }

        return equipmentRepository
                .findByOwnerEmailIgnoreCase(
                        ownerEmail.trim()
                );
    }

    public Equipment addEquipment(Equipment equipment) {

        if (equipment.getOwnerEmail() == null ||
                equipment.getOwnerEmail().trim().isEmpty()) {

            throw new RuntimeException("Owner email is required");
        }

        String ownerEmail =
                equipment.getOwnerEmail()
                        .trim()
                        .toLowerCase();

        User user =
                userRepository
                        .findByEmailIgnoreCase(ownerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User account not found"
                                ));

        if (!user.isCitizenshipProvided()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please provide your citizenship before listing equipment"
            );
        }

        equipment.setOwnerEmail(ownerEmail);
        equipment.setAvailable(true);

        return equipmentRepository.save(equipment);
    }

    public Equipment updateEquipment(
            Long id,
            Equipment updatedEquipment
    ) {

        Equipment existingEquipment =
                equipmentRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Equipment not found"
                                ));

        existingEquipment.setName(
                updatedEquipment.getName()
        );

        existingEquipment.setCategory(
                updatedEquipment.getCategory()
        );

        existingEquipment.setPrice(
                updatedEquipment.getPrice()
        );

        existingEquipment.setLocation(
                updatedEquipment.getLocation()
        );

        existingEquipment.setDescription(
                updatedEquipment.getDescription()
        );

        existingEquipment.setAvailable(
                updatedEquipment.isAvailable()
        );

        if (updatedEquipment.getImageUrl() != null &&
                !updatedEquipment.getImageUrl().trim().isEmpty()) {

            existingEquipment.setImageUrl(
                    updatedEquipment.getImageUrl()
            );
        }

        return equipmentRepository.save(
                existingEquipment
        );
    }

    public void deleteEquipment(Long id) {

        if (!equipmentRepository.existsById(id)) {
            throw new RuntimeException(
                    "Equipment not found"
            );
        }

        equipmentRepository.deleteById(id);
    }
}