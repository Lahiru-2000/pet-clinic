import { Component, OnInit } from '@angular/core';
import { PetService } from '../../services/pet.service';
import { AuthService } from '../../auth.service';
declare var bootstrap: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  pets: any[] = [];
  selectedPet: any = null;
  editing = false;
  userEmail: string | null = null;

  // Search form values
  search = {
    petname: '',
    owner: ''
  };

  // New Pet form model
  newPet = {
    name: '',
    owner: '',
    type: '',
    breed: '',
    age: null
  };

  constructor(
    private petService: PetService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get the logged-in user's email
    this.userEmail = this.authService.getUserEmail();
    
    if (this.userEmail) {
      this.getUserPets();
    } else {
      console.error('User not logged in or email not found');
    }
  }

  // 📥 Get pets for the logged-in user only
  getUserPets() {
    if (!this.userEmail) return;

    // Try to use the specific endpoint for user pets, with fallback to filtering all pets
    this.petService.getPetsByUserEmail(this.userEmail).subscribe(
      (data) => {
        this.pets = data;
      },
      (error) => {
        // Fallback: if the backend doesn't support the user-specific endpoint yet,
        // fetch all pets and filter on the frontend
        console.warn('User-specific pet endpoint not available, using fallback method');
        this.petService.getPets().subscribe((data) => {
          this.pets = data.filter(pet => pet.owner === this.userEmail);
        });
      }
    );
  }

  // 🔍 Search pet by name and owner
  searchPet() {
    if (!this.search.petname || !this.search.owner) return;

    this.petService.getPetByPetnameAndOwner(this.search.petname, this.search.owner)
      .subscribe(
        (pet) => {
          // Only show the pet if it belongs to the logged-in user
          if (pet.owner === this.userEmail) {
            this.selectedPet = pet;
            this.editing = false;
          } else {
            console.warn('Pet does not belong to the logged-in user');
            this.selectedPet = null;
            // Open add modal with pre-filled data
            this.newPet.name = this.search.petname;
            this.newPet.owner = this.userEmail || '';
            this.openAddPetModal();
          }
        },
        (error) => {
          console.warn('Pet not found, switch to add form');
          this.selectedPet = null;
          // Open add modal with pre-filled data
          this.newPet.name = this.search.petname;
          this.newPet.owner = this.userEmail || '';
          this.openAddPetModal();
        }
      );
  }

  // ✏️ Start edit mode
  // startEdit(pet: any) {
  //   this.selectedPet = { ...pet }; // make a copy
  //   this.editing = true;
  // }

  // ✅ Save edited pet
 startEdit(pet: any) {
    this.selectedPet = { ...pet };
    this.editing = true;

    // Open Bootstrap modal programmatically
    const modalElement = document.getElementById('editPetModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  cancelEdit() {
    this.editing = false;
    this.selectedPet = null;

    // Hide modal manually if needed
    const modalElement = document.getElementById('editPetModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  saveEdit() {
    if (!this.selectedPet?.id) return;

    this.petService.editPet(this.selectedPet.id, this.selectedPet).subscribe(
      (res) => {
        console.log('Pet updated:', res);
        this.editing = false;
        this.getUserPets(); // Refresh user's pets
        this.selectedPet = null;

        // Hide modal after saving
        const modalElement = document.getElementById('editPetModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) modal.hide();
        }
      },
      (err) => {
        console.error('Error updating pet:', err);
      }
    );
  }


  // 🧹 Reset form
  clearNewPetForm() {
    this.newPet = {
      name: '',
      owner: this.userEmail || '', // Always pre-fill with user email
      type: '',
      breed: '',
      age: null
    };
  }



  // 🔹 Open Add Pet Modal
  openAddPetModal() {
    this.clearNewPetForm();
    // Auto-fill owner with logged-in user's email
    this.newPet.owner = this.userEmail || '';
    
    // Open Bootstrap modal
    const modalElement = document.getElementById('addPetModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // 🔹 Close Add Pet Modal
  closeAddPetModal() {
    this.clearNewPetForm();
    
    // Hide modal
    const modalElement = document.getElementById('addPetModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  // ➕ Add new pet (updated to close modal)
  addPet() {
    // Ensure the owner is set to the logged-in user's email
    this.newPet.owner = this.userEmail || '';
    
    const { name, owner } = this.newPet;

    this.petService.findByPetnameAndOwner(name, owner).subscribe(
      (existingPet) => {
        alert('This pet already exists!');
      },
      (error) => {
        if (error.status === 404) {
          this.petService.addPet(this.newPet).subscribe(
            (res) => {
              console.log('Pet added:', res);
              this.getUserPets(); // Refresh user's pets
              this.clearNewPetForm();
              this.closeAddPetModal(); // Close modal instead of hiding form
            },
            (err) => {
              console.error('Error adding pet:', err);
              alert('Failed to add pet.');
            }
          );
        } else {
          alert('Something went wrong while checking for duplicates.');
        }
      }
    );
  }
}
