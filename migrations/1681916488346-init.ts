import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1681916488346 implements MigrationInterface {
    name = 'Init1681916488346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('ACTIVE', 'UNVERIFIED')`);
        await queryRunner.query(`CREATE TABLE "user" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "id" SERIAL NOT NULL, "password" character varying(1000) NOT NULL, "status" "public"."user_status_enum" NOT NULL, "device_tokens" text array, "phone_number" character varying(50), "address" character varying(255), "email" character varying(255), "name" character varying(50), "birth_date" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_token_type_enum" AS ENUM('VERIFICATION_EMAIL')`);
        await queryRunner.query(`CREATE TYPE "public"."user_token_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "user_token" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "id" SERIAL NOT NULL, "type" "public"."user_token_type_enum" NOT NULL, "token" character varying(1000) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."user_token_status_enum" NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_48cb6b5c20faa63157b3c1baf7f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_token" ADD CONSTRAINT "FK_79ac751931054ef450a2ee47778" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_token" DROP CONSTRAINT "FK_79ac751931054ef450a2ee47778"`);
        await queryRunner.query(`DROP TABLE "user_token"`);
        await queryRunner.query(`DROP TYPE "public"."user_token_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_token_type_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
    }

}
