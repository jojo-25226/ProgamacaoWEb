DROP DATABASE IF EXISTS facebook_clone;
CREATE DATABASE facebook_clone;

USE facebook_clone;

CREATE TABLE users (
	id int auto_increment primary key,
    username nvarchar(50) not null unique,
    email nvarchar(100) not null unique,
    password_hash nvarchar(255) not null,
    birthDate date not null,
    gender nvarchar(3) not null default "N/D",
    pfp nvarchar(255) null,
    bio nvarchar(255) null,
    createdAt timestamp default current_timestamp
);

CREATE TABLE friendRequests (
    senderId INT
		REFERENCES users(id) ON DELETE CASCADE,
    receiverId INT
		REFERENCES users(id) ON DELETE CASCADE,
	status ENUM('Accepted', 'Declined', 'Pending') default 'Pending',
        
	PRIMARY KEY(senderId, receiverId),
    
    -- Impede auto-amizade
    CONSTRAINT no_self_friendship CHECK (senderId <> receiverId),
    
	-- Impede duplicados
    CONSTRAINT unique_friendship UNIQUE(
        (LEAST(senderId, receiverId)),
        (GREATEST(senderId, receiverId))
    )
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content NVARCHAR(191) NOT NULL,
    image NVARCHAR(191) NULL,
    userId INTEGER NOT NULL
		REFERENCES users(id) ON DELETE CASCADE,
    createdAt timestamp default current_timestamp
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(191) NOT NULL,
    userId INT NOT NULL
		REFERENCES users(id) ON DELETE CASCADE,
    postId INT NOT NULL
		REFERENCES posts(id) ON DELETE CASCADE,
    createdAt timestamp default current_timestamp
);

CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    postId INT NOT NULL,
    createdAt timestamp default current_timestamp,

    UNIQUE(userId, postId)
);

CREATE TABLE messages (
	id INT auto_increment PRIMARY KEY,
    senderId INT NOT NULL
		REFERENCES users(id) ON DELETE CASCADE,
    receiverId INT NOT NULL
		REFERENCES users(id) ON DELETE CASCADE,
	content nvarchar(255) NOT NULL,
    createdAt timestamp default current_timestamp
);