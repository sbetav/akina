CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credentials_id" uuid,
	"user_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(12, 2) NOT NULL,
	"unit_measure_id" text NOT NULL,
	"standard_code_id" text NOT NULL,
	"tribute_id" text NOT NULL,
	"tax_rate" numeric(5, 2) NOT NULL,
	"is_excluded" boolean DEFAULT false NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_userId_credentialsId_code_unique" UNIQUE("user_id","credentials_id","code")
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_credentials_id_factus_credentials_id_fk" FOREIGN KEY ("credentials_id") REFERENCES "public"."factus_credentials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_credentialsId_idx" ON "products" USING btree ("credentials_id");--> statement-breakpoint
CREATE INDEX "products_userId_idx" ON "products" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "products_credentialsId_name_idx" ON "products" USING btree ("credentials_id","name");