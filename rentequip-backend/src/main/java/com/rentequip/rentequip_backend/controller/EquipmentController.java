package com.rentequip.rentequip_backend.controller;

import com.rentequip.rentequip_backend.entity.Equipment;
import com.rentequip.rentequip_backend.service.EquipmentService;
import com.rentequip.rentequip_backend.service.FileStorageService;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final FileStorageService fileStorageService;

    public EquipmentController(
            EquipmentService equipmentService,
            FileStorageService fileStorageService
    ) {
        this.equipmentService = equipmentService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public List<Equipment> getAllEquipment() {
        return equipmentService.getAllEquipment();
    }

    @GetMapping("/owner")
    public List<Equipment> getEquipmentByOwnerEmail(
            @RequestParam String email
    ) {
        return equipmentService.getEquipmentByOwnerEmail(email);
    }

    @GetMapping("/{id}")
    public Equipment getEquipmentById(
            @PathVariable Long id
    ) {
        return equipmentService.getEquipmentById(id);
    }

    @PostMapping
    public Equipment addEquipment(
            @RequestBody Equipment equipment
    ) {
        return equipmentService.addEquipment(equipment);
    }

    @PutMapping("/{id}")
    public Equipment updateEquipment(
            @PathVariable Long id,
            @RequestBody Equipment equipment
    ) {
        return equipmentService.updateEquipment(id, equipment);
    }

    @DeleteMapping("/{id}")
    public void deleteEquipment(
            @PathVariable Long id
    ) {
        equipmentService.deleteEquipment(id);
    }

    @PostMapping(
            value = "/upload-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public String uploadEquipmentImage(
            @RequestParam("image") MultipartFile image
    ) {
        return fileStorageService.saveFile(
                image,
                "equipment"
        );
    }
}