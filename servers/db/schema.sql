alter user root identified with mysql_native_password by 'password';
flush privileges;

create table if not exists Users (
    ID int not null auto_increment primary key,
    Email varchar(255) not null unique, /* https://stackoverflow.com/questions/7717573/what-is-the-longest-possible-email-address  */
    PassHash binary(60) not null, /* https://stackoverflow.com/questions/5881169/what-column-type-length-should-i-use-for-storing-a-bcrypt-hashed-password-in-a-d */
    UserName varchar(255) not null unique,
    FirstName varchar(128) not null,
    LastName varchar(128) not null,
    PhotoURL varchar(2083) not null
);

create table if not exists SuccessfulSignIns (
  ID int not null auto_increment primary key,
  UserID int not null,
  stamp datetime not null,
  ClientIP varchar(15) not null
);
