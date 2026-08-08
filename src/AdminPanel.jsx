package com.monprojet.portfolio_family_chat.controller;

import com.monprojet.portfolio_family_chat.dto.UserResponse;
import com.monprojet.portfolio_family_chat.entity.FamilyCode;
import com.monprojet.portfolio_family_chat.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"https://hadjidine-b.onrender.com", "https://hadjidine-f.vercel.app"}, allowedHeaders = "*", allowCredentials = "true")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // GET /api/admin/users : Lister tous les membres
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // PUT /api/admin/users/{id}/toggle-status : Activer ou Désactiver un compte
    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<String> toggleUserStatus(@PathVariable Long id, Authentication authentication) {
        try {
            // Transmet l'email de l'admin connecté pour empêcher l'auto-désactivation
            adminService.toggleUserActive(id, authentication.getName());
            return ResponseEntity.ok("Statut de l'utilisateur mis à jour.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/admin/users/{id} : Supprimer définitivement un membre
    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id, Authentication authentication) {
        try {
            // Transmet l'email de l'admin connecté pour empêcher l'auto-suppression
            adminService.deleteUser(id, authentication.getName());
            return ResponseEntity.ok("Utilisateur supprimé avec succès.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/admin/users/{id}/reset-password : Réinitialiser le mot de passe d'un membre
    @PutMapping("/users/{id}/reset-password")
    public ResponseEntity<String> resetPassword(@PathVariable Long id, @RequestParam String newPassword) {
        try {
            adminService.resetPassword(id, newPassword);
            return ResponseEntity.ok("Mot de passe réinitialisé avec succès.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST /api/admin/family-code : Définir un nouveau code d'accès familial
    @PostMapping("/family-code")
    public ResponseEntity<FamilyCode> updateFamilyCode(@RequestParam String code) {
        return ResponseEntity.ok(adminService.updateFamilyCode(code));
    }
}