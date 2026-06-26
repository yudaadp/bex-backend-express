CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users
(
    id             UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    username       VARCHAR(10)  NOT NULL UNIQUE,
    name           VARCHAR(60)  NOT NULL,
    email          VARCHAR(120) NOT NULL UNIQUE,
    password       TEXT         NOT NULL,
    role_id        integer      NOT NULL,
    active         char(1)               DEFAULT 'Y',
    created_by     VARCHAR(10),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_update_by VARCHAR(10),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE INDEX IF NOT EXISTS users_username_idx ON users (username);

CREATE TABLE IF NOT EXISTS roles
(
    id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_name      VARCHAR(30) NOT NULL UNIQUE,
    role_desc      VARCHAR(220),
    active         char(1)              DEFAULT 'Y',
    created_by     VARCHAR(10),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_update_by VARCHAR(10),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO roles (role_name, role_desc, created_by, last_update_by)
VALUES ('admin', 'administrator', 'bex', 'bex'),
       ('staff', 'staff user role ', 'bex', 'bex');

CREATE TABLE IF NOT EXISTS permissions
(
    id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    permission     VARCHAR(50)  NOT NULL UNIQUE, -- format: 'product:create' or 'product.create'
    module_name    VARCHAR(50)  NOT NULL,        -- ex: 'product', 'category', 'users'
    action_name    VARCHAR(20)  NOT NULL,        -- ex: 'create', 'read', 'approve'
    description    VARCHAR(220),
    active         CHAR(1)      DEFAULT 'Y',
    created_by     VARCHAR(10),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_update_by VARCHAR(10),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions
(
    role_id        INT NOT NULL,
    permission_id  INT NOT NULL,
    granted_by     VARCHAR(10),
    granted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_perm FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
);

ALTER TABLE users
    ADD CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT;

INSERT INTO permissions (permission, module_name, action_name, description, created_by)
VALUES
    ('users:create', 'users', 'create', 'Allow user to create user', 'bex'),
    ('users:update', 'users', 'update', 'Allow user to update user', 'bex'),
    ('users:read', 'users', 'read', 'Allow user to read user', 'bex'),
    ('users:delete', 'users', 'delete', 'Allow user to delete user', 'bex');

-- Anggap role_id untuk 'admin' adalah 1
-- Dan permission_id untuk 'users:create' (1), 'users:approve' (2), 'users:read' (3).....
-- Berikan semua permission tersebut ke admin

INSERT INTO role_permissions (role_id, permission_id, granted_by)
VALUES
    (1, 1, 'bex'),
    (1, 2, 'bex'),
    (1, 3, 'bex'),
    (1, 4, 'bex');

-- CREATE SAMPLE USER FOR ADMIN

INSERT INTO users (username, name, email, password, role_id, created_by, last_update_by) VALUES
    ('admin','bex administrator', 'admin@bex.com','$2a$12$iaE9HElCYi4pBDX5vGUFHemGF0pryy4bRqzWEDHZ17OpWH4T/eAcC',1,'bex','bex');
