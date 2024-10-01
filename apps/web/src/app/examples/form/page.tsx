"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import Checkbox from "@repo/ui/form/checkBox";
import InputField from "@repo/ui/form/inputField";
import NumericField from "@repo/ui/form/numericField";
import RadioButton from "@repo/ui/form/radioButton";
import TextAreaField from "@repo/ui/form/textAreaField";
import Toggle from "@repo/ui/form/toggle";
import { useForm } from "react-hook-form";
import { z } from "zod";

const exampleSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name must be at most 50 characters"),
	email: z
		.string()
		.email("Invalid email address")
		.min(5, "Email must be at least 5 characters"),
	age: z.coerce
		.number()
		.min(18, "You must be at least 18 years old")
		.max(120, "Age must be at most 120"),
	gender: z.enum(["male", "female", "other"]),
	termsAccepted: z.boolean().refine((val) => val === true, {
		message: "You must accept the terms and conditions",
	}),
	notifications: z.boolean(),
	bio: z
		.string()
		.min(10, "Bio must be at least 10 characters")
		.max(500, "Bio must be at most 500 characters"),
});

type ExampleFormData = z.infer<typeof exampleSchema>;

function TestPage() {
	const { control, handleSubmit } = useForm<ExampleFormData>({
		resolver: zodResolver(exampleSchema),
		defaultValues: {
			name: "",
			email: "",
			age: 18,
			gender: undefined,
			termsAccepted: false,
			notifications: false,
			bio: "",
		},
		mode: "onBlur",
	});

	const onSubmit = (data: ExampleFormData) => {
		console.log(data);
	};

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-6">Component Test Page</h1>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-4">Form Components</h2>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<InputField<ExampleFormData>
						name="name"
						control={control}
						label="Name"
						placeholder="Enter your name"
					/>
					<InputField<ExampleFormData>
						name="email"
						control={control}
						label="Email"
						placeholder="Enter your email"
					/>
					<NumericField<ExampleFormData>
						name="age"
						control={control}
						label="Age"
						min={18}
						max={120}
					/>
					<div>
						<label className="block mb-2">Gender</label>
						<div className="space-y-2">
							<RadioButton<ExampleFormData>
								name="gender"
								control={control}
								label="Male"
								value="male"
							/>
							<RadioButton<ExampleFormData>
								name="gender"
								control={control}
								label="Female"
								value="female"
							/>
							<RadioButton<ExampleFormData>
								name="gender"
								control={control}
								label="Other"
								value="other"
							/>
						</div>
					</div>
					<TextAreaField<ExampleFormData>
						name="bio"
						control={control}
						label="Bio"
						placeholder="Tell us about yourself"
						rows={4}
					/>
					<Checkbox<ExampleFormData>
						name="termsAccepted"
						control={control}
						label="I accept the terms and conditions"
					/>
					<Toggle<ExampleFormData>
						name="notifications"
						control={control}
						label="Enable notifications"
					/>
					<div className="space-y-4">
						<Button type="submit" variant="primary" size="sm">
							Submit (Primary Small)
						</Button>
						<Button type="submit" variant="primary" size="md">
							Submit (Primary Medium)
						</Button>
						<Button type="submit" variant="primary" size="lg">
							Submit (Primary Large)
						</Button>
						<Button type="submit" variant="primary" size="xl">
							Submit (Primary Extra Large)
						</Button>
						<Button type="submit" variant="secondary" size="sm">
							Submit (Secondary Small)
						</Button>
						<Button type="submit" variant="secondary" size="md">
							Submit (Secondary Medium)
						</Button>
						<Button type="submit" variant="secondary" size="lg">
							Submit (Secondary Large)
						</Button>
						<Button type="submit" variant="secondary" size="xl">
							Submit (Secondary Extra Large)
						</Button>
					</div>
				</form>
			</section>
		</div>
	);
}

export default TestPage;
