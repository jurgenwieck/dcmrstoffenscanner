create table dbo.inspections (
    id nvarchar(64) not null primary key,
    user_id nvarchar(256) null,
    name nvarchar(256) null,
    status nvarchar(32) not null,
    notes nvarchar(max) null,
    location nvarchar(256) null,
    has_warnings bit not null default 0,
    warnings nvarchar(max) null,
    created_at datetime2 not null default sysdatetime(),
    updated_at datetime2 not null default sysdatetime(),
    completed_at datetime2 null
);

create table dbo.inspection_photos (
    id nvarchar(64) not null primary key,
    inspection_id nvarchar(64) not null,
    image_url nvarchar(1024) null,
    image_description nvarchar(max) null,
    status nvarchar(32) not null,
    created_at datetime2 not null default sysdatetime(),
    completed_at datetime2 null,
    constraint fk_inspection_photos_inspections
        foreign key (inspection_id) references dbo.inspections(id)
);

create table dbo.substances (
    id nvarchar(64) not null,
    photo_id nvarchar(64) not null,
    user_id nvarchar(256) null,
    name nvarchar(512) not null,
    adr_class nvarchar(64) null,
    packaging_group nvarchar(64) null,
    quantity decimal(18, 4) null,
    unit nvarchar(16) null,
    specific_gravity decimal(10, 4) null,
    number_of_items int null,
    un_number nvarchar(64) null,
    cas_number nvarchar(64) null,
    ghs_pictograms nvarchar(max) null,
    confidence decimal(5, 4) null,
    pictogram_confidence decimal(5, 4) null,
    ai_reasoning nvarchar(max) null,
    ai_model nvarchar(128) null,
    ai_timestamp datetime2 null,
    is_over_limit bit null,
    limit_exceeded nvarchar(max) null,
    human_override bit null,
    human_override_reason nvarchar(max) null,
    created_at datetime2 not null default sysdatetime(),
    constraint pk_substances primary key (id, photo_id),
    constraint fk_substances_inspection_photos
        foreign key (photo_id) references dbo.inspection_photos(id)
);

create index ix_inspections_user_id on dbo.inspections(user_id);
create index ix_inspection_photos_inspection_id on dbo.inspection_photos(inspection_id);
create index ix_substances_photo_id on dbo.substances(photo_id);
