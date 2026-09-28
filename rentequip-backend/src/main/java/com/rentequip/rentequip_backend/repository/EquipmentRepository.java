package com.rentequip.rentequip_backend.repository;

import com.rentequip.rentequip_backend.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByOwnerEmailIgnoreCase(String ownerEmail);

    List<Equipment> findAllByOrderByIdDesc();
}