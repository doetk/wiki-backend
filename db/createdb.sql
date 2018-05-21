\connect wiki
CREATE TABLE public.page (
	  pageid character varying(50) NOT NULL,
	  revisionid integer NOT NULL,
	  title character varying(50) NOT NULL,
	  modified timestamp without time zone,
	  author integer NOT NULL,
	  pagedata text,
	  CONSTRAINT page_pk PRIMARY KEY (pageid, revisionid),
	  CONSTRAINT page_revisionid_positive CHECK (revisionid >= 0),
	  CONSTRAINT page_author_positive CHECK (author >= 0)
) WITH (
  OIDS=FALSE
);
ALTER TABLE public.page OWNER TO postgres;
CREATE OR REPLACE FUNCTION public.page_process_before()
  RETURNS trigger AS
$BODY$
BEGIN
	    NEW.pageid := UPPER(NEW.pageid);
	    NEW.modified := NOW();
	    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION public.page_process_before() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.page_process_before() FROM public;
CREATE TRIGGER process_entry
   BEFORE INSERT OR UPDATE
   ON page
   FOR EACH ROW
      EXECUTE PROCEDURE page_process_before();

CREATE TABLE public.users (
    userid SERIAL,
	  username TEXT NOT NULL,
	  passhash TEXT NOT NULL,
	  first_name TEXT,
	  last_name TEXT,
	  email TEXT NOT NULL,
	  last_logout timestamp without time zone DEFAULT now(),
	  CONSTRAINT users_pk PRIMARY KEY (userid),
    CONSTRAINT users_username_unique UNIQUE(username),
	  CONSTRAINT users_email_unique UNIQUE (email)
) WITH (
  OIDS=FALSE
);

ALTER TABLE public.users OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.email_to_lower()
  RETURNS trigger AS
$BODY$
BEGIN
	    NEW.email = LOWER(NEW.email);
	    RETURN NEW;
END

$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

ALTER FUNCTION public.email_to_lower() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.email_to_lower() FROM public;

CREATE TRIGGER process_users_entry
   BEFORE INSERT OR UPDATE
   ON users
   FOR EACH ROW
	   EXECUTE PROCEDURE email_to_lower();
