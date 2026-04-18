import { z } from "zod";

// ========================================
// Join Family Tree — Self-Registration
// ========================================

export const joinFamilyTreeSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Please select a gender",
  }),
  dateOfBirth: z.string().optional().nullable(),
  familyClan: z.string().max(100).optional().nullable(),
  photo: z.string().url("Invalid photo URL").optional().nullable().or(z.literal("")),
  bio: z.string().max(1000, "Bio must be at most 1000 characters").optional().nullable(),
  maritalStatus: z
    .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"])
    .optional(),
  bloodGroup: z.string().max(10).optional().nullable(),
  profession: z
    .string()
    .max(100, "Profession must be at most 100 characters")
    .optional()
    .nullable(),
  isAlive: z.boolean(),
});

export type JoinFamilyTreeInput = z.infer<typeof joinFamilyTreeSchema>;

// ========================================
// Add Relative — Node + Edge Creation
// ========================================

export const addRelativeSchema = z.object({
  // Edge details
  relatedToNodeId: z.string().min(1, "Related member is required"),
  relationshipType: z.enum(["FATHER", "MOTHER", "SPOUSE", "CHILD", "BROTHER", "SISTER"], {
    message: "Please select a relationship type",
  }),

  // New Node details
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Please select a gender",
  }),
  dateOfBirth: z.string().optional().nullable(),
  dateOfDeath: z.string().optional().nullable(),
  isAlive: z.boolean(),
  familyClan: z.string().max(100).optional().nullable(),
  maritalStatus: z
    .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"])
    .optional()
    .nullable(),
  bloodGroup: z.string().max(10).optional().nullable(),
  profession: z.string().max(100).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),

  // Second parent (optional, for CHILD relationship)
  secondParentId: z.string().optional().nullable(),

  // Edge metadata
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  order: z.number().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export type AddRelativeInput = z.infer<typeof addRelativeSchema>;

// ========================================
// Update Family Member
// ========================================

export const updateFamilyMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z.string().optional().nullable(),
  dateOfDeath: z.string().optional().nullable(),
  familyClan: z.string().max(100).optional().nullable(),
  photo: z.string().refine(val => val === '' || z.string().url().safeParse(val).success, { message: "Must be a valid URL." }).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]).optional(),
  bloodGroup: z.string().max(10).optional().nullable(),
  profession: z.string().max(100).optional().nullable(),
  isAlive: z.boolean().optional(),
});

export type UpdateFamilyMemberInput = z.infer<typeof updateFamilyMemberSchema>;

// ========================================
// Request Residency Access
// ========================================

export const requestResidencySchema = z.object({
  fatherName: z.string().min(2, "Father's name is required"),
  motherName: z.string().min(2, "Mother's name is required"),
  acknowledgement: z.literal(true, {
    message: "You must acknowledge the guidelines.",
  }),
});

export type RequestResidencyInput = z.infer<typeof requestResidencySchema>;

// ========================================
// Link Existing Member as Relative
// ========================================

export const linkExistingRelativeSchema = z.object({
  targetNodeId: z.string().min(1, "Target member is required"),
  existingNodeId: z.string().min(1, "Existing member is required"),
  relationshipType: z.enum(["FATHER", "MOTHER", "SPOUSE", "CHILD", "BROTHER", "SISTER"], {
    message: "Please select a relationship type",
  }),
});

export type LinkExistingRelativeInput = z.infer<typeof linkExistingRelativeSchema>;
