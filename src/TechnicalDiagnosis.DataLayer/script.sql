The EF Core tools version '3.0.0' is older than that of the runtime '3.1.0'. Update the tools for the latest features and bug fixes.
info: Microsoft.EntityFrameworkCore.Infrastructure[10403]
      Entity Framework Core 3.1.0 initialized 'ApplicationDbContext' using provider 'Microsoft.EntityFrameworkCore.SqlServer' with options: CommandTimeout=180 
IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;

GO

CREATE TABLE [Roles] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
);

GO

CREATE TABLE [Users] (
    [Id] int NOT NULL IDENTITY,
    [Username] nvarchar(450) NOT NULL,
    [Password] nvarchar(max) NOT NULL,
    [DisplayName] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [LastLoggedIn] datetimeoffset NULL,
    [SerialNumber] nvarchar(450) NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);

GO

CREATE TABLE [UserRoles] (
    [UserId] int NOT NULL,
    [RoleId] int NOT NULL,
    CONSTRAINT [PK_UserRoles] PRIMARY KEY ([UserId], [RoleId]),
    CONSTRAINT [FK_UserRoles_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserRoles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

GO

CREATE TABLE [UserTokens] (
    [Id] int NOT NULL IDENTITY,
    [AccessTokenHash] nvarchar(max) NULL,
    [AccessTokenExpiresDateTime] datetimeoffset NOT NULL,
    [RefreshTokenIdHash] nvarchar(450) NOT NULL,
    [RefreshTokenIdHashSource] nvarchar(450) NULL,
    [RefreshTokenExpiresDateTime] datetimeoffset NOT NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_UserTokens] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_UserTokens_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

GO

CREATE UNIQUE INDEX [IX_Roles_Name] ON [Roles] ([Name]);

GO

CREATE INDEX [IX_UserRoles_RoleId] ON [UserRoles] ([RoleId]);

GO

CREATE INDEX [IX_UserRoles_UserId] ON [UserRoles] ([UserId]);

GO

CREATE UNIQUE INDEX [IX_Users_Username] ON [Users] ([Username]);

GO

CREATE INDEX [IX_UserTokens_UserId] ON [UserTokens] ([UserId]);

GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20191129194336_V2019_11_29_2312', N'3.1.0');

GO

CREATE TABLE [TypeVehicles] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(max) NULL,
    [TimeInterval] int NOT NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_TypeVehicles] PRIMARY KEY ([Id])
);

GO

CREATE TABLE [Plates] (
    [Id] int NOT NULL IDENTITY,
    [FullName] nvarchar(max) NULL,
    [Mobile] nvarchar(max) NULL,
    [PlateState] nvarchar(max) NULL,
    [PlateFirstNumber] nvarchar(max) NULL,
    [PlateAlphabet] nvarchar(max) NULL,
    [PlateLastNumber] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [ServiceDate] datetime2 NOT NULL,
    [IsTechnicalDiagnosis] bit NOT NULL,
    [TypeVehicleId] int NOT NULL,
    [Description] nvarchar(max) NULL,
    CONSTRAINT [PK_Plates] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Plates_TypeVehicles_TypeVehicleId] FOREIGN KEY ([TypeVehicleId]) REFERENCES [TypeVehicles] ([Id]) ON DELETE CASCADE
);

GO

CREATE INDEX [IX_Plates_TypeVehicleId] ON [Plates] ([TypeVehicleId]);

GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20191201204444_V2019_12_02_0014', N'3.1.0');

GO

ALTER TABLE [Plates] DROP CONSTRAINT [FK_Plates_TypeVehicles_TypeVehicleId];

GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Plates]') AND [c].[name] = N'TypeVehicleId');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Plates] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [Plates] ALTER COLUMN [TypeVehicleId] int NULL;

GO

ALTER TABLE [Plates] ADD CONSTRAINT [FK_Plates_TypeVehicles_TypeVehicleId] FOREIGN KEY ([TypeVehicleId]) REFERENCES [TypeVehicles] ([Id]) ON DELETE NO ACTION;

GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20191202211626_V2019_12_03_0046', N'3.1.0');

GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20191206100828_V2019_12_06_1337', N'3.1.0');

GO

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TypeVehicles]') AND [c].[name] = N'TimeInterval');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [TypeVehicles] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [TypeVehicles] DROP COLUMN [TimeInterval];

GO

ALTER TABLE [TypeVehicles] ADD [Days] int NOT NULL DEFAULT 0;

GO

ALTER TABLE [TypeVehicles] ADD [Description] nvarchar(max) NULL;

GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20200106032506_V2020_01_06_0654', N'3.1.0');

GO

DECLARE @var2 sysname;
SELECT @var2 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Plates]') AND [c].[name] = N'IsTechnicalDiagnosis');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [Plates] DROP CONSTRAINT [' + @var2 + '];');
ALTER TABLE [Plates] DROP COLUMN [IsTechnicalDiagnosis];

GO

CREATE TABLE [TemplateMessages] (
    [Id] int NOT NULL IDENTITY,
    [CreateDate] datetime2 NOT NULL,
    [Type] int NOT NULL,
    [Content] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [Description] nvarchar(max) NULL,
    CONSTRAINT [PK_TemplateMessages] PRIMARY KEY ([Id])
);

GO

CREATE TABLE [Messages] (
    [Id] int NOT NULL IDENTITY,
    [Mobile] nvarchar(max) NULL,
    [Content] nvarchar(max) NULL,
    [CreateDate] datetime2 NOT NULL,
    [SendDate] datetime2 NOT NULL,
    [IsActive] bit NOT NULL,
    [Status] bit NOT NULL,
    [TemplateMessageId] int NULL,
    [PlateId] int NULL,
    [Description] nvarchar(max) NULL,
    CONSTRAINT [PK_Messages] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Messages_Plates_PlateId] FOREIGN KEY ([PlateId]) REFERENCES [Plates] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Messages_TemplateMessages_TemplateMessageId] FOREIGN KEY ([TemplateMessageId]) REFERENCES [TemplateMessages] ([Id]) ON DELETE NO ACTION
);

GO

CREATE TABLE [PlateDetails] (
    [Id] int NOT NULL IDENTITY,
    [Date] datetime2 NOT NULL,
    [IsTechnicalDiagnosis] bit NOT NULL,
    [Description] nvarchar(max) NULL,
    [PlateId] int NULL,
    [MessageId] int NULL,
    CONSTRAINT [PK_PlateDetails] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PlateDetails_Messages_MessageId] FOREIGN KEY ([MessageId]) REFERENCES [Messages] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_PlateDetails_Plates_PlateId] FOREIGN KEY ([PlateId]) REFERENCES [Plates] ([Id]) ON DELETE NO ACTION
);

GO

CREATE INDEX [IX_Messages_PlateId] ON [Messages] ([PlateId]);

GO

CREATE INDEX [IX_Messages_TemplateMessageId] ON [Messages] ([TemplateMessageId]);

GO

CREATE INDEX [IX_PlateDetails_MessageId] ON [PlateDetails] ([MessageId]);

GO

CREATE INDEX [IX_PlateDetails_PlateId] ON [PlateDetails] ([PlateId]);

GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20200123193026_V2020_01_23_2259', N'3.1.0');

GO


