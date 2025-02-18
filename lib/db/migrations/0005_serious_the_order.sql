CREATE TABLE IF NOT EXISTS "car" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"mileage" integer NOT NULL,
	"engine_capacity" integer NOT NULL,
	"fuel_type" text NOT NULL,
	"year" integer NOT NULL,
	"condition" text NOT NULL,
	"power" integer NOT NULL,
	"damages" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
