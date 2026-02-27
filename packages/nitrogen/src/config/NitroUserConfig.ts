import { z } from "zod";

// Namespaces and package names in C++/Java will be matched with a regex.
const safeNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

const isNotReservedKeyword = (val: string) =>
  !["core", "nitro", "NitroModules"].includes(val);
const isReservedKeywordError = {
  message: `This value is reserved and cannot be used!`,
};

export const NitroUserConfigSchema = z.object({
  /**
   * Represents the C++ namespace of the module that will be generated.
   *
   * This can have multiple sub-namespaces, and is always relative to `margelo::nitro`.
   * @example `['image']` -> `margelo::nitro::image`
   */
  cxxNamespace: z
    .array(
      z
        .string()
        .regex(safeNamePattern)
        .refine(isNotReservedKeyword, isReservedKeywordError),
    )
    .min(1),
  /**
   * iOS specific options.
   */
  ios: z.object({
    /**
     * Represents the iOS module name of the module that will be generated.
     *
     * This will be used to generate Swift bridges, as those are always namespaced within the clang module.
     *
     * If you are using CocoaPods, this should be the Pod name defined in the `.podspec`.
     * @example `NitroTest`
     */
    iosModuleName: z
      .string()
      .regex(safeNamePattern)
      .refine(isNotReservedKeyword, isReservedKeywordError),
  }),
  /**
   * Android specific options.
   */
  android: z.object({
    /**
     * Represents the Android namespace ("package") of the module that will be generated.
     *
     * This can have multiple sub-namespaces, and is always relative to `com.margelo.nitro`.
     * @example `['image']` -> `com.margelo.nitro.image`
     */
    androidNamespace: z
      .array(
        z
          .string()
          .regex(safeNamePattern)
          .refine(isNotReservedKeyword, isReservedKeywordError),
      )
      .min(1),

    /**
     * Represents the name of the Android C++ library (aka name in CMakeLists.txt `add_library(..)`).
     * This will be loaded via `System.loadLibrary(...)`.
     * @example `NitroTest`
     */
    androidCxxLibName: z
      .string()
      .regex(safeNamePattern)
      .refine(isNotReservedKeyword, isReservedKeywordError),
  }),
  /**
   * Rust-specific options for the generated Rust crate.
   */
  rust: z
    .object({
      /**
       * The Cargo crate name of the user's Rust implementation crate.
       * This is added as a dependency in the generated Cargo.toml so that
       * factory.rs can import the implementation structs.
       * @example `"jazz-nitro"`
       */
      implCrate: z.string(),
    })
    .optional(),
  /**
   * Configures the code that gets generated for autolinking (registering)
   * Hybrid Object constructors.
   *
   * Each class listed here needs to have a default constructor/initializer that takes
   * zero arguments.
   */
  autolinking: z.record(
    z.string(),
    z.object({
      cpp: z.string().optional(),
      swift: z.string().optional(),
      kotlin: z.string().optional(),
      rust: z.string().optional(),
    }),
  ),
  /**
   * A list of paths relative to the project directory that should be ignored by nitrogen.
   * Nitrogen will not look for `.nitro.ts` files in these directories.
   */
  ignorePaths: z.array(z.string()).optional(),
  /**
   * Configures whether all nitro-generated files are marked as
   * [`linguist-generated`](https://docs.github.com/en/repositories/working-with-files/managing-files/customizing-how-changed-files-appear-on-github)
   * for GitHub. This disables diffing for generated content and excludes them from language statistics.
   * This is controlled via `nitrogen/generated/.gitattributes`.
   */
  gitAttributesGeneratedFlag: z.boolean().optional().default(true),
});

/**
 * Represents the structure of a `nitro.json` config file.
 */
export type NitroUserConfig = z.infer<typeof NitroUserConfigSchema>;
