// URL base da API
const API_BASE_URL = 'http://localhost:3000'; // Altere conforme necessário
const API_BASE_URL2 = 'http://localhost:3001';

// ==============================================
// FUNÇÕES PARA PACIENTES
// ==============================================

async function fetchAllPatients() {
    try {
        const response = await fetch(`${API_BASE_URL}/getPaciente`);
        if (!response.ok) throw new Error('Erro ao buscar pacientes');
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Erro:', error);
        return [];
    }
}

async function registerPatient(patientData) {
    try {
        const response = await fetch(`${API_BASE_URL}/postPaciente`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientData)
        });
        if (!response.ok) throw new Error('Erro ao cadastrar paciente');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function loadPatients() {
    try {
        const patients = await fetchAllPatients();
        const patientList = document.getElementById('patient-list');
        patientList.innerHTML = '';
        
        patients.forEach(patient => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${patient.id}</td>
                <td>${patient.nome}</td>
                <td>${patient.cpf}</td>
                <td>${new Date(patient.dataNascimento).toLocaleDateString()}</td>
                <td>${patient.telefone || '-'}</td>
                <td>
                    <button class="btn btn-primary" style="padding: 5px 10px; font-size: 12px;" disabled>Editar</button>
                    <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" disabled>Excluir</button>
                </td>
            `;
            patientList.appendChild(row);
        });
        
        document.getElementById('patient-count').textContent = patients.length;
    } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        alert('Erro ao carregar pacientes');
    }
}

function setupPatientForm() {
    const patientForm = document.getElementById('patient-form');
    if (!patientForm) return;

    patientForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const patientData = {
            nome: document.getElementById('patient-name').value,
            cpf: document.getElementById('patient-cpf').value,
            dataNascimento: document.getElementById('patient-birthdate').value,
            telefone: document.getElementById('patient-phone').value,
            email: document.getElementById('patient-email').value
        };
        
        if (!patientData.nome || !patientData.cpf || !patientData.dataNascimento) {
            alert('Nome, CPF e Data de Nascimento são obrigatórios!');
            return;
        }
        
        try {
            await registerPatient(patientData);
            await loadPatients();
            patientForm.reset();
            alert('Paciente cadastrado com sucesso!');
        } catch (error) {
            alert(error.message.includes('Unique constraint failed') 
                ? 'CPF ou e-mail já cadastrado!' 
                : 'Erro ao cadastrar paciente');
        }
    });
}

function setupPatientSearch() {
    const patientSearch = document.getElementById('patient-search');
    if (!patientSearch) return;

    patientSearch.addEventListener('input', async function() {
        const searchTerm = this.value.toLowerCase();
        const patients = await fetchAllPatients();
        const patientList = document.getElementById('patient-list');
        patientList.innerHTML = '';
        
        patients.filter(patient => {
            return patient.nome.toLowerCase().includes(searchTerm) || 
                   patient.cpf.toLowerCase().includes(searchTerm);
        }).forEach(patient => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${patient.id}</td>
                <td>${patient.nome}</td>
                <td>${patient.cpf}</td>
                <td>${new Date(patient.dataNascimento).toLocaleDateString()}</td>
                <td>${patient.telefone || '-'}</td>
                <td>
                    <button class="btn btn-primary" style="padding: 5px 10px; font-size: 12px;" disabled>Editar</button>
                    <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" disabled>Excluir</button>
                </td>
            `;
            patientList.appendChild(row);
        });
    });
}

// ==============================================
// FUNÇÕES PARA CONSULTAS
// ==============================================

async function fetchAllConsults() {
    try {
        const response = await fetch(`${API_BASE_URL2}/getConsulta`);
        if (!response.ok) throw new Error('Erro ao buscar consultas');
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Erro:', error);
        return [];
    }
}

async function registerConsultation(consultData) {
    try {
        const response = await fetch(`${API_BASE_URL2}/postConsulta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reason: consultData.motivo,
                patientId: consultData.pacienteId
            })
        });
        if (!response.ok) throw new Error('Erro ao agendar consulta');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function loadAppointments() {
    try {
        const appointments = await fetchAllConsults();
        const patients = await fetchAllPatients();
        const appointmentList = document.getElementById('appointment-list');
        appointmentList.innerHTML = '';
        
        appointments.forEach(appointment => {
            const patient = patients.find(p => p.id === appointment.pacienteId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.id}</td>
                <td>${new Date(appointment.dataHora).toLocaleString()}</td>
                <td>${patient ? patient.nome : 'Paciente não encontrado'}</td>
                <td>${appointment.motivo}</td>
                <td>
                    <button class="btn btn-primary" style="padding: 5px 10px; font-size: 12px;" disabled>Editar</button>
                    <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" disabled>Excluir</button>
                </td>
            `;
            appointmentList.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar consultas:', error);
        alert('Erro ao carregar consultas');
    }
}

function setupAppointmentForm() {
    const appointmentForm = document.getElementById('appointment-form');
    if (!appointmentForm) return;

    // Carrega pacientes no select quando a aba de consultas é aberta
    document.querySelector('.nav-link[data-service="appointment"]').addEventListener('click', async function() {
        try {
            const patients = await fetchAllPatients();
            const patientSelect = document.getElementById('appointment-patient');
            patientSelect.innerHTML = '<option value="">Selecione um paciente</option>';
            
            patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = patient.nome;
                patientSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar pacientes:', error);
        }
    });

    appointmentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const consultData = {
            motivo: document.getElementById('appointment-reason').value,
            pacienteId: parseInt(document.getElementById('appointment-patient').value),
            dataHora: document.getElementById('appointment-date').value
        };
        
        if (!consultData.motivo || !consultData.pacienteId || !consultData.dataHora) {
            alert('Paciente, Data/Hora e Motivo são obrigatórios!');
            return;
        }
        
        try {
            await registerConsultation(consultData);
            await loadAppointments();
            appointmentForm.reset();
            alert('Consulta agendada com sucesso!');
        } catch (error) {
            alert('Erro ao agendar consulta. Por favor, tente novamente.');
        }
    });
}

function setupAppointmentSearch() {
    const appointmentSearch = document.getElementById('appointment-search');
    if (!appointmentSearch) return;

    appointmentSearch.addEventListener('input', async function() {
        const searchTerm = this.value.toLowerCase();
        const appointments = await fetchAllConsults();
        const patients = await fetchAllPatients();
        const appointmentList = document.getElementById('appointment-list');
        appointmentList.innerHTML = '';
        
        appointments.filter(appointment => {
            const patient = patients.find(p => p.id === appointment.pacienteId);
            const patientName = patient ? patient.nome.toLowerCase() : '';
            return patientName.includes(searchTerm) ||
                   appointment.motivo.toLowerCase().includes(searchTerm) ||
                   new Date(appointment.dataHora).toLocaleString().toLowerCase().includes(searchTerm);
        }).forEach(appointment => {
            const patient = patients.find(p => p.id === appointment.pacienteId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.id}</td>
                <td>${new Date(appointment.dataHora).toLocaleString()}</td>
                <td>${patient ? patient.nome : 'Paciente não encontrado'}</td>
                <td>${appointment.motivo}</td>
                <td>
                    <button class="btn btn-primary" style="padding: 5px 10px; font-size: 12px;" disabled>Editar</button>
                    <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" disabled>Excluir</button>
                </td>
            `;
            appointmentList.appendChild(row);
        });
    });
}

// ==============================================
// NAVEGAÇÃO E INICIALIZAÇÃO
// ==============================================

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const serviceContainers = document.querySelectorAll('.services-container');
    const pageTitle = document.getElementById('page-title');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            serviceContainers.forEach(container => container.classList.remove('active'));
            const serviceId = this.getAttribute('data-service');
            document.getElementById(serviceId).classList.add('active');
            
            updatePageTitle(serviceId);
        });
    });

    function updatePageTitle(serviceId) {
        const titles = {
            'dashboard': 'Dashboard',
            'patient': 'Gestão de Pacientes',
            'appointment': 'Gestão de Consultas',
            'medical-record': 'Gestão de Prontuários',
            'billing': 'Gestão de Faturamento'
        };
        pageTitle.textContent = titles[serviceId];
    }

    const cardButtons = document.querySelectorAll('.card-footer .btn');
    cardButtons.forEach(button => {
        button.addEventListener('click', function() {
            const serviceId = this.getAttribute('data-service');
            
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            document.querySelector(`.nav-link[data-service="${serviceId}"]`).classList.add('active');
            
            serviceContainers.forEach(container => container.classList.remove('active'));
            document.getElementById(serviceId).classList.add('active');
            
            updatePageTitle(serviceId);
        });
    });
}

async function initializeApp() {
    try {
        setupNavigation();
        setupPatientForm();
        setupPatientSearch();
        setupAppointmentForm();
        setupAppointmentSearch();
        
        await loadPatients();
        await loadAppointments();
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);