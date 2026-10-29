
CREATE TABLE clients (
    id BIGINT NOT NULL AUTO_INCREMENT,
    legal_name VARCHAR(200) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    time_zone VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL,
    primary_associate VARCHAR(150),
    backup_associate VARCHAR(150),
    stage VARCHAR(80),
    status VARCHAR(80),
    due_date TIMESTAMP(6) NULL,
    open_items INT,
    last_activity TIMESTAMP(6) NULL,
    invitation_status VARCHAR(80),
    created_at TIMESTAMP(6) NULL,
    PRIMARY KEY (id)
);

CREATE TABLE invitations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    invite_type VARCHAR(30) NOT NULL,
    email VARCHAR(254) NOT NULL,
    status VARCHAR(80) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    token VARCHAR(128) UNIQUE,
    invited_by VARCHAR(254),
    expires_at TIMESTAMP(6) NULL,
    accepted_at TIMESTAMP(6) NULL,
    PRIMARY KEY (id)
);

CREATE TABLE team_members (
    id BIGINT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    role VARCHAR(100) NOT NULL,
    status VARCHAR(80),
    invitation_status VARCHAR(80),
    last_sign_in TIMESTAMP(6) NULL,
    created_at TIMESTAMP(6) NULL,
    PRIMARY KEY (id)
);


