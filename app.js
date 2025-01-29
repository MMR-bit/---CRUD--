// Assuming skills will be fetched from the server or hardcoded for now
const skillsList = ['JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js'];

const specialists = [];

document.addEventListener("DOMContentLoaded", () => {
  loadSpecialists();
  loadSkills();

  document.getElementById('addSpecialistButton').addEventListener('click', () => {
    openModal('add');
  });

  document.getElementById('specialistForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const specialist = {
      id: `S${Date.now()}`, // Generate unique ID for the specialist
      fullName: formData.get('fullName'),
      availableStartTime: formData.get('availableStartTime'),
      availableEndTime: formData.get('availableEndTime'),
      skills: formData.getAll('skills')
    };
    if (formData.get('id')) {
      // Edit specialist
      const index = specialists.findIndex(spec => spec.id === formData.get('id'));
      specialists[index] = specialist;
    } else {
      // Add new specialist
      specialists.push(specialist);
    }
    closeModal();
    loadSpecialists();
  });
});

function loadSpecialists() {
  const specialistsListElement = document.getElementById('specialistsList');
  specialistsListElement.innerHTML = '';

  specialists.forEach(specialist => {
    const specialistElement = document.createElement('div');
    specialistElement.classList.add('specialist');
    specialistElement.innerHTML = `
      <p><strong>${specialist.fullName}</strong> (ID: ${specialist.id})</p>
      <p>Available: ${specialist.availableStartTime} - ${specialist.availableEndTime}</p>
      <p>Skills: ${specialist.skills.join(', ')}</p>
      <button onclick="openModal('edit', '${specialist.id}')">Edit</button>
      <button onclick="removeSpecialist('${specialist.id}')">Remove</button>
    `;
    specialistsListElement.appendChild(specialistElement);
  });
}

function loadSkills() {
  const skillsSelect = document.getElementById('skills');
  skillsList.forEach(skill => {
    const option = document.createElement('option');
    option.value = skill;
    option.textContent = skill;
    skillsSelect.appendChild(option);
  });
}

function openModal(mode, specialistId = '') {
  const modal = document.getElementById('specialistModal');
  const form = document.getElementById('specialistForm');
  const title = document.getElementById('modalTitle');
  
  if (mode === 'edit') {
    const specialist = specialists.find(spec => spec.id === specialistId);
    title.textContent = 'Edit Specialist';
    document.getElementById('fullName').value = specialist.fullName;
    document.getElementById('id').value = specialist.id;
    document.getElementById('availableStartTime').value = specialist.availableStartTime;
    document.getElementById('availableEndTime').value = specialist.availableEndTime;
    specialist.skills.forEach(skill => {
      const option = Array.from(document.getElementById('skills').options)
        .find(option => option.value === skill);
      option.selected = true;
    });
  } else {
    title.textContent = 'Add Specialist';
    form.reset();
  }
  
  modal.style.display = "block";
}

function closeModal() {
  const modal = document.getElementById('specialistModal');
  modal.style.display = "none";
}

function removeSpecialist(id) {
  const index = specialists.findIndex(spec => spec.id === id);
  if (index !== -1) {
    specialists.splice(index, 1);
    loadSpecialists();
  }
}
