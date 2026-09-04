CREATE TABLE "download_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "file_type" varchar(50) NOT NULL,
  "downloaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboarding_progress" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "step_account_created" boolean DEFAULT true NOT NULL,
  "step_app_downloaded" boolean DEFAULT false NOT NULL,
  "step_csv_viewer_downloaded" boolean DEFAULT false NOT NULL,
  "step_tutorial_watched" boolean DEFAULT false NOT NULL,
  "step_first_rubric_created" boolean DEFAULT false NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "onboarding_progress_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "download_logs" ADD CONSTRAINT "download_logs_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "download_logs_user_id_idx" ON "download_logs" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "download_logs_downloaded_at_idx" ON "download_logs" USING btree ("downloaded_at");
--> statement-breakpoint
CREATE INDEX "onboarding_progress_user_id_idx" ON "onboarding_progress" USING btree ("user_id");