BEGIN;


CREATE TABLE IF NOT EXISTS public.discounts
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "numberOfApplicants" integer NOT NULL,
    "idProgramOffering" uuid,
    percentage integer NOT NULL,
    CONSTRAINT "PK_66c522004212dc814d6e2f14ecc" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.docent_school_grades
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "idDocent" uuid NOT NULL,
    "idSchoolGrade" uuid NOT NULL,
    CONSTRAINT "PK_7b8518eec22994400624b181388" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.docent_seminars
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    nationality character varying COLLATE pg_catalog."default" NOT NULL,
    document_type character varying COLLATE pg_catalog."default" NOT NULL,
    document_number character varying COLLATE pg_catalog."default" NOT NULL,
    address character varying COLLATE pg_catalog."default" NOT NULL,
    phone character varying COLLATE pg_catalog."default" NOT NULL,
    "idSchoolGrade" uuid,
    CONSTRAINT "PK_99a7e84fd3150dc419097b99753" PRIMARY KEY (id),
    CONSTRAINT "UQ_c22883738f986a5028a44ec80bc" UNIQUE (document_number),
    CONSTRAINT "UQ_c4dc065953d6dd07a951a8c0631" UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS public.docents
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    nationality character varying COLLATE pg_catalog."default" NOT NULL,
    document_type character varying COLLATE pg_catalog."default" NOT NULL,
    document_number character varying COLLATE pg_catalog."default" NOT NULL,
    address character varying COLLATE pg_catalog."default" NOT NULL,
    phone character varying COLLATE pg_catalog."default" NOT NULL,
    "schoolGradeId" uuid,
    CONSTRAINT "PK_f8ccb5bfe5cc596f50a0357cadb" PRIMARY KEY (id),
    CONSTRAINT "UQ_30b4e12ac315ec4c6e8982c3b0a" UNIQUE (document_number)
);

CREATE TABLE IF NOT EXISTS public.faculties
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    name character varying(150) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "PK_fd83e4a09c7182ccf7bdb3770b9" PRIMARY KEY (id),
    CONSTRAINT "UQ_39747c4153c669f1db683e8f231" UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS public.methodologies
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "PK_be6131d4407e0b0396801cd04d1" PRIMARY KEY (id),
    CONSTRAINT "UQ_6c780d50afecfde7555c5c53a50" UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS public.modalities
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "PK_4135bf3c2e5bb971c20b08bbef1" PRIMARY KEY (id),
    CONSTRAINT "UQ_e6de06e62c9e55b41a875f9d4fa" UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS public.pensums
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "idPensumExternal" integer,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    "startYear" integer NOT NULL,
    status character varying COLLATE pg_catalog."default" NOT NULL DEFAULT 'en oferta'::character varying,
    credits integer NOT NULL,
    "idProgram" uuid,
    CONSTRAINT "PK_19f60c60fcbf6f3c682792c1b0e" PRIMARY KEY (id),
    CONSTRAINT "UQ_PENSUM_PROGRAM" UNIQUE ("idProgram", id),
    CONSTRAINT "UQ_pensum_startYear" UNIQUE ("startYear", "idProgram")
);

CREATE TABLE IF NOT EXISTS public.program_offerings
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "idProgramPlacement" uuid,
    "idPensum" uuid,
    "idSmmlv" uuid,
    "idFee" uuid,
    "idProgram" uuid,
    cohort integer NOT NULL,
    semester integer NOT NULL,
    "codeCDP" character varying COLLATE pg_catalog."default",
    "idDocent" uuid,
    CONSTRAINT "PK_03d864c122fe31913c46f13723d" PRIMARY KEY (id),
    CONSTRAINT "UQ_PROGRAM_COHORT_SEMESTER_PENSUM" UNIQUE ("idProgramPlacement", "idProgram", cohort, semester, "idPensum")
);

CREATE TABLE IF NOT EXISTS public.program_placements
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "idProgram" uuid,
    "idMethodology" uuid,
    "idFaculty" uuid,
    "idModality" uuid,
    unity character varying COLLATE pg_catalog."default" NOT NULL,
    workday character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "PK_c64cd5174e1c1b0395173329a94" PRIMARY KEY (id),
    CONSTRAINT "UQ_PROGRAM" UNIQUE (id, "idProgram")
);

CREATE TABLE IF NOT EXISTS public.programs
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "idProgramExternal" integer,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "PK_d43c664bcaafc0e8a06dfd34e05" PRIMARY KEY (id),
    CONSTRAINT "UQ_ba50d0f7b68ee5b73f7e7b8fdf9" UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS public.rates
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    factor_smmlv numeric(6, 2) NOT NULL,
    credit_value_smmlv numeric(6, 2) NOT NULL,
    "modalityId" uuid,
    CONSTRAINT "PK_2c804ed4019b80ce48eedba5cec" PRIMARY KEY (id),
    CONSTRAINT "REL_f77effc033a5f5fec4a6c4a273" UNIQUE ("modalityId")
);

CREATE TABLE IF NOT EXISTS public.school_grade_seminars
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    level integer NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "PK_9a96fff002c3b5952f6a34f75ed" PRIMARY KEY (id),
    CONSTRAINT "UQ_7b981acae3b2f36b8b131655384" UNIQUE (name),
    CONSTRAINT "UQ_ab69f3c5cb49bb9f3d72dc2aa22" UNIQUE (level)
);

CREATE TABLE IF NOT EXISTS public.school_grades
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    level integer NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "PK_b58246a4baec960c455308a9767" PRIMARY KEY (id),
    CONSTRAINT "UQ_2bb840ff089112de4155324cc28" UNIQUE (level),
    CONSTRAINT "UQ_4e2750f16754411a88f1e9246a2" UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS public.seminar_dates
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    date timestamp with time zone NOT NULL,
    "seminarId" uuid,
    CONSTRAINT "PK_b1ed999e09c1b257192e3b9480b" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.seminar_docents
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    vinculation character varying COLLATE pg_catalog."default" NOT NULL,
    "seminarId" uuid,
    "docentId" uuid,
    CONSTRAINT "PK_23ffcb19b33a01a7a13786cfef9" PRIMARY KEY (id),
    CONSTRAINT "REL_97fa3d0793d92eb2e124ca49f8" UNIQUE ("seminarId")
);

CREATE TABLE IF NOT EXISTS public.seminar_program_offerings
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "idSeminar" uuid NOT NULL,
    "idProgramOffering" uuid NOT NULL,
    CONSTRAINT "PK_134fbd4cea4daa52a6f8bd0382d" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.seminaries
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    credits integer NOT NULL,
    payment_type character varying COLLATE pg_catalog."default" NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    "airTransportValue" numeric(12, 2),
    "airTransportRoute" character varying COLLATE pg_catalog."default",
    "landTransportValue" numeric(12, 2),
    "landTransportRoute" character varying COLLATE pg_catalog."default",
    "foodAndLodgingAid" numeric(12, 2),
    "eventStayDays" integer,
    "hotelLocation" character varying COLLATE pg_catalog."default",
    CONSTRAINT "PK_ef60f593a150e4796611584318b" PRIMARY KEY (id),
    CONSTRAINT "UQ_b8db89b3db91bb411b68885857e" UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS public.smmlvs
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    year integer NOT NULL,
    value numeric(12, 2) NOT NULL,
    CONSTRAINT "PK_ff864cad53a6a7c5de613c1e219" PRIMARY KEY (id),
    CONSTRAINT "UQ_add69d80f0d4c19f03d7a2559bf" UNIQUE (year)
);

CREATE TABLE IF NOT EXISTS public.users
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    email character varying COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default" NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    "isActive" boolean NOT NULL DEFAULT true,
    role users_role_enum NOT NULL DEFAULT 'user'::users_role_enum,
    CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id),
    CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email)
);

ALTER TABLE IF EXISTS public.discounts
    ADD CONSTRAINT "FK_669070efd4d25ee2ed387cc6510" FOREIGN KEY ("idProgramOffering")
    REFERENCES public.program_offerings (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.docent_seminars
    ADD CONSTRAINT "FK_dfbbbcce4a54b3a779676fc6bb4" FOREIGN KEY ("idSchoolGrade")
    REFERENCES public.school_grade_seminars (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.docents
    ADD CONSTRAINT "FK_89d094a81fe3db8a2e3d8f74504" FOREIGN KEY ("schoolGradeId")
    REFERENCES public.school_grades (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.pensums
    ADD CONSTRAINT "FK_d78681b1a99b85b12eb32aa4f11" FOREIGN KEY ("idProgram")
    REFERENCES public.programs (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.program_offerings
    ADD CONSTRAINT "FK_1069a347ca5cbb4bffaa46e1998" FOREIGN KEY ("idProgramPlacement", "idProgram")
    REFERENCES public.program_placements (id, "idProgram") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.program_offerings
    ADD CONSTRAINT "FK_55683bd2b4fb8c461ff0451f6b3" FOREIGN KEY ("idFee")
    REFERENCES public.rates (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.program_offerings
    ADD CONSTRAINT "FK_8e5df0259a278c0ce7f09acb31d" FOREIGN KEY ("idSmmlv")
    REFERENCES public.smmlvs (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.program_offerings
    ADD CONSTRAINT "FK_97bcf7dd0631c2f506fd36cc4e2" FOREIGN KEY ("idDocent")
    REFERENCES public.docent_seminars (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.program_offerings
    ADD CONSTRAINT "FK_f8771ab48d75d261b752ed5648d" FOREIGN KEY ("idPensum", "idProgram")
    REFERENCES public.pensums (id, "idProgram") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.program_placements
    ADD CONSTRAINT "FK_16c404c97bb142c8f646e1ac2e1" FOREIGN KEY ("idModality")
    REFERENCES public.modalities (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.program_placements
    ADD CONSTRAINT "FK_17d2da1eca52c51216603a36e45" FOREIGN KEY ("idProgram")
    REFERENCES public.programs (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.program_placements
    ADD CONSTRAINT "FK_4e5c7f6881312494c401eaaf76f" FOREIGN KEY ("idMethodology")
    REFERENCES public.methodologies (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.program_placements
    ADD CONSTRAINT "FK_65d0111b810806952bb6f00f810" FOREIGN KEY ("idFaculty")
    REFERENCES public.faculties (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.rates
    ADD CONSTRAINT "FK_f77effc033a5f5fec4a6c4a273f" FOREIGN KEY ("modalityId")
    REFERENCES public.modalities (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS "REL_f77effc033a5f5fec4a6c4a273"
    ON public.rates("modalityId");


ALTER TABLE IF EXISTS public.seminar_dates
    ADD CONSTRAINT "FK_eba5a2c61585c38a4c43f6eece8" FOREIGN KEY ("seminarId")
    REFERENCES public.seminaries (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.seminar_docents
    ADD CONSTRAINT "FK_022913d14d30a1e5d18b15dc959" FOREIGN KEY ("docentId")
    REFERENCES public.docent_seminars (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.seminar_docents
    ADD CONSTRAINT "FK_97fa3d0793d92eb2e124ca49f8e" FOREIGN KEY ("seminarId")
    REFERENCES public.seminaries (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS "REL_97fa3d0793d92eb2e124ca49f8"
    ON public.seminar_docents("seminarId");


ALTER TABLE IF EXISTS public.seminar_program_offerings
    ADD CONSTRAINT "FK_71700084b595fa592d1fee8b01e" FOREIGN KEY ("idSeminar")
    REFERENCES public.seminaries (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.seminar_program_offerings
    ADD CONSTRAINT "FK_a8485a4e1f1ae4e04eadedd8a5e" FOREIGN KEY ("idProgramOffering")
    REFERENCES public.program_offerings (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

END;