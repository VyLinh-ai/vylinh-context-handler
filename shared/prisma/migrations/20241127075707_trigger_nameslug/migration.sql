-- Generate Slug From Input
CREATE OR REPLACE FUNCTION generate_slug(title VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    slug VARCHAR;
BEGIN
    -- Convert to lowercase
    slug := LOWER(title);

    -- Replace accented characters
    slug := TRANSLATE(slug,
        'áàảạãăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ',
        'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd');

    -- Replace consecutive hyphens with a single hyphen
    slug := REGEXP_REPLACE(slug, '-{2,}', '', 'g');

    -- Remove leading and trailing hyphens
    slug := TRIM(BOTH '-' FROM slug);
	
	-- Replace special characters
    slug := REGEXP_REPLACE(slug, '[^a-z0-9]', '', 'g');

    RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Function Change Name Slug when 
CREATE OR REPLACE FUNCTION generate_slug_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure the title is not null before generating the slug
    IF NEW."nameSlug" IS NULL OR NEW."name" IS DISTINCT FROM OLD."name" THEN
        -- Update the "nameSlug" column with the new slug
        NEW."nameSlug" := generate_slug(NEW."name");
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_slug_trigger_1()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure the title is not null before generating the slug
    IF NEW."nameSlug" IS NULL OR NEW."contractName" IS DISTINCT FROM OLD."contractName" THEN
        -- Update the "nameSlug" column with the new slug
        NEW."nameSlug" := generate_slug(NEW."contractName");
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- Trigger Create Collection
CREATE OR REPLACE TRIGGER project_generate_slug
BEFORE INSERT OR UPDATE OF "name" ON "Project"
FOR EACH ROW
EXECUTE FUNCTION generate_slug_trigger();


-- Trigger Create NFT 
CREATE OR REPLACE TRIGGER smc_generate_slug
BEFORE INSERT OR UPDATE OF "contractName" ON "SmartContract"
FOR EACH ROW
EXECUTE FUNCTION generate_slug_trigger_1();
