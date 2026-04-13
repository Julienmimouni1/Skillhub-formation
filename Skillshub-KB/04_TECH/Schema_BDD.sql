-- Script de création de la base de données SkillHub Formation V1
-- SGBD : PostgreSQL

-- ========= EXTENSIONS =========
-- Optionnel, mais utile pour générer des UUID si nécessaire un jour
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========= ENUM TYPES =========
-- Création de types custom pour standardiser les entrées (évite les fautes de frappe)

CREATE TYPE user_role AS ENUM (
    'collaborateur',
    'manager',
    'rh',
    'admin'
);

CREATE TYPE request_status AS ENUM (
    'DRAFT',            -- Créé par le collaborateur, non soumis
    'PENDING_MANAGER',  -- En attente de validation N+1
    'PENDING_RH',       -- En attente de validation RH (budget, conformité)
    'APPROVED',         -- Approuvé par RH (budget engagé)
    'REJECTED',         -- Refusé (par N+1 ou RH)
    'PLANNED',          -- Dates de session confirmées, convention signée
    'COMPLETED',        -- Formation réalisée, attestation reçue
    'ARCHIVED'          -- Dossier clos et archivé
);

CREATE TYPE request_type AS ENUM (
    'OBLIGATOIRE',      -- Légal, sécurité, conventionnel
    'PLAN_DEV',         -- Plan de développement des compétences
    'CPF',              -- Compte Personnel de Formation (souvent co-investi)
    'AUTRE'             -- Demande hors cadre
);

CREATE TYPE document_type AS ENUM (
    'DEVIS',
    'PROGRAMME',
    'CONVENTION',
    'ATTESTATION',
    'FACTURE',
    'AUTRE'
);

CREATE TYPE validation_action AS ENUM (
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
    'COMMENTED'
);


-- ========= TABLE CREATION =========

-- Table des Départements / Services (pour la gestion budgétaire)
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    budget_allocated NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    budget_engaged NUMERIC(12, 2) NOT NULL DEFAULT 0.00,  -- Coûts 'APPROVED' + 'PLANNED'
    budget_consumed NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Coûts 'COMPLETED'
    year INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des Utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Ne jamais stocker de mot de passe en clair
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'collaborateur',
    
    department_id INT,
    manager_id INT, -- Auto-référence vers l'ID du manager
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_department FOREIGN KEY(department_id) REFERENCES departments(id),
    CONSTRAINT fk_manager FOREIGN KEY(manager_id) REFERENCES users(id)
);

-- Table des Organismes de formation
CREATE TABLE providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    contact_email VARCHAR(255),
    phone VARCHAR(50),
    url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table Principale : Demandes de Formation
CREATE TABLE training_requests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    user_id INT NOT NULL,
    manager_id INT, -- ID du manager au moment de la demande (pour historique)
    department_id INT NOT NULL, -- ID du département au moment de la demande
    
    provider_id INT,
    
    cost NUMERIC(10, 2) NOT NULL,
    cost_type VARCHAR(10) DEFAULT 'HT', -- HT ou TTC
    
    status request_status NOT NULL DEFAULT 'DRAFT',
    type request_type NOT NULL DEFAULT 'PLAN_DEV',
    
    start_date DATE,
    end_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id),
    CONSTRAINT fk_manager FOREIGN KEY(manager_id) REFERENCES users(id),
    CONSTRAINT fk_department FOREIGN KEY(department_id) REFERENCES departments(id),
    CONSTRAINT fk_provider FOREIGN KEY(provider_id) REFERENCES providers(id),
    
    -- Une demande ne peut pas avoir un coût négatif
    CONSTRAINT chk_cost CHECK (cost >= 0) 
);

-- Table des Documents liés aux demandes
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL, -- Chemin S3, GCS ou disque local
    mimetype VARCHAR(100),
    file_size_kb INT,
    document_type document_type NOT NULL,
    
    uploaded_by_user_id INT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_request FOREIGN KEY(request_id) REFERENCES training_requests(id) ON DELETE CASCADE, -- Supprime les docs si la demande est supprimée
    CONSTRAINT fk_uploader FOREIGN KEY(uploaded_by_user_id) REFERENCES users(id)
);

-- Table de Traçabilité (Audit Log / Historique des validations)
-- CRUCIAL pour la conformité légale et le debug
CREATE TABLE validation_history (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL,
    actor_id INT NOT NULL, -- Qui a fait l'action (user_id)
    
    action validation_action NOT NULL,
    comment TEXT, -- Obligatoire si action = REJECTED
    
    previous_status request_status, -- Statut avant l'action
    new_status request_status,      -- Statut après l'action
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_request FOREIGN KEY(request_id) REFERENCES training_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_actor FOREIGN KEY(actor_id) REFERENCES users(id)
);


-- ========= INDEXES =========
-- Ajout d'index pour accélérer les requêtes courantes

-- Recherches rapides d'utilisateurs
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_users_manager_id ON users(manager_id);

-- Recherches rapides de demandes (par utilisateur, par statut, par département)
CREATE INDEX idx_requests_user_id ON training_requests(user_id);
CREATE INDEX idx_requests_status ON training_requests(status);
CREATE INDEX idx_requests_department_id ON training_requests(department_id);

-- Recherches rapides de documents et d'historique
CREATE INDEX idx_documents_request_id ON documents(request_id);
CREATE INDEX idx_history_request_id ON validation_history(request_id);


-- ========= INITIAL DATA (Exemples) =========
-- Insertion des données de base pour que l'app fonctionne

-- Insérer des départements
INSERT INTO departments (name, budget_allocated, year) VALUES
('Tech', 50000.00, 2025),
('Sales', 30000.00, 2025),
('Marketing', 25000.00, 2025),
('RH', 10000.00, 2025);

-- (Note : L'insertion d'utilisateurs nécessite la gestion des mots de passe hashés, 
-- ce qui sera fait côté backend, pas en SQL pur ici)
-- Exemple :
-- INSERT INTO users (email, password_hash, first_name, last_name, role, department_id, manager_id)
-- VALUES ('admin@skillhub.com', 'hash_a_definir', 'Admin', 'SkillHub', 'admin', 4, NULL);

-- INSERT INTO users (email, password_hash, first_name, last_name, role, department_id, manager_id)
-- VALUES ('manager.tech@skillhub.com', 'hash_a_definir', 'Marie', 'Dupont', 'manager', 1, 1); -- Manager Tech, report à l'admin

-- INSERT INTO users (email, password_hash, first_name, last_name, role, department_id, manager_id)
-- VALUES ('dev.junior@skillhub.com', 'hash_a_definir', 'Pierre', 'Durand', 'collaborateur', 1, 2); -- Dev Junior, report à Marie Dupont