package com.rentequip.rentequip_backend.repository;

import com.rentequip.rentequip_backend.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long> {

    List<Rental> findByCustomerEmailIgnoreCase(String customerEmail);

    List<Rental> findByOwnerEmailIgnoreCase(String ownerEmail);

    List<Rental> findByEquipmentId(Long equipmentId);

    boolean existsByEquipmentIdAndStatus(Long equipmentId, String status);
}