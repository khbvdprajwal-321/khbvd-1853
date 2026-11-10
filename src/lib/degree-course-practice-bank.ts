import type { PracticeQuestion, PracticeTrack } from '@/lib/types';

type DegreeTrack = Extract<PracticeTrack, 'degree-it' | 'degree-nonit' | 'business-hr' | 'business-operations' | 'business-management'>;

interface CourseItem {
  topic: string;
  question: string;
  answer: string;
  explanation: string;
  difficulty: PracticeQuestion['difficulty'];
}

const cQuestions: CourseItem[] = [
  { topic: 'Types and declarations', question: 'In C, what does the declaration `const int limit = 12;` prevent?', answer: 'Modifying limit through that identifier after initialization', explanation: '`const` makes the object non-modifiable through this name. It does not make every pointer to the object const, nor does it mean the value is stored in read-only hardware.', difficulty: 'easy' },
  { topic: 'Types and declarations', question: 'Which type is intended to hold a single basic execution character in C?', answer: 'char', explanation: '`char` is the integer type used to represent execution-character-set values. Its signedness is implementation-defined, so use `unsigned char` when byte values must be nonnegative.', difficulty: 'easy' },
  { topic: 'Types and declarations', question: 'What is the value of `sizeof(char)` in every conforming C implementation?', answer: '1', explanation: '`sizeof` measures bytes, and the C standard defines one byte as the size of a `char`. A byte need not be exactly eight bits on every implementation.', difficulty: 'easy' },
  { topic: 'Types and declarations', question: 'Why can `sizeof(array) / sizeof(array[0])` count elements for a local array?', answer: 'sizeof(array) gives the whole array size in bytes in that scope', explanation: 'An array expression used as the operand of `sizeof` is not converted to a pointer. Dividing the total byte size by one element’s byte size gives the element count.', difficulty: 'medium' },
  { topic: 'Types and declarations', question: 'What does `unsigned int n = 0; n--;` produce under unsigned arithmetic?', answer: 'The maximum representable unsigned int value', explanation: 'Unsigned arithmetic is defined modulo one more than the maximum value. Decrementing zero therefore wraps to that maximum instead of causing signed-overflow undefined behavior.', difficulty: 'medium' },
  { topic: 'Types and declarations', question: 'What is the main risk of using `sizeof(pointer)` to infer a dynamically allocated array length?', answer: 'It reports the pointer object size, not the allocated element count', explanation: 'A pointer stores an address and carries no array-length metadata. Preserve the element count separately and use it to bound access and allocation calculations.', difficulty: 'medium' },
  { topic: 'Types and declarations', question: 'Which statement about `enum { RED, GREEN = 4, BLUE };` is correct?', answer: 'RED is 0, GREEN is 4, and BLUE is 5', explanation: 'The first enumerator defaults to zero. An enumerator without an explicit value is one greater than the immediately preceding enumerator.', difficulty: 'easy' },
  { topic: 'Types and declarations', question: 'What does `volatile` communicate to the compiler about an object?', answer: 'Its value may change for reasons outside ordinary program flow', explanation: '`volatile` requires accesses to be treated as observable side effects according to the abstract machine. It does not provide atomicity, inter-thread synchronization, or a memory lock.', difficulty: 'difficult' },
  { topic: 'Types and declarations', question: 'Why should a program use `int32_t` only when that typedef is available?', answer: 'The exact-width typedef is optional on implementations without an exact 32-bit type', explanation: 'The `<stdint.h>` exact-width types are provided only when the implementation has a type of that precise width without padding bits. Portable code can use minimum-width types when exact width is unnecessary.', difficulty: 'difficult' },
  { topic: 'Types and declarations', question: 'What is the purpose of `typedef unsigned long size_type;`?', answer: 'It creates an alias name for the existing type', explanation: '`typedef` introduces a type synonym, not a new distinct arithmetic type. The alias can improve readability but retains the original type’s representation and rules.', difficulty: 'medium' },
  { topic: 'Operators and expressions', question: 'What is the result of integer division `7 / 2` when both operands are int?', answer: '3', explanation: 'Integer division discards the fractional part by truncating toward zero. At least one operand must be converted to floating point before division to obtain 3.5.', difficulty: 'easy' },
  { topic: 'Operators and expressions', question: 'In `x = a + b * c`, which operation is grouped first by precedence?', answer: 'b * c', explanation: 'Multiplication has higher precedence than addition. Parentheses are still useful when they make a nontrivial expression’s intended grouping clearer.', difficulty: 'easy' },
  { topic: 'Operators and expressions', question: 'What does the expression `p != NULL && *p == target` protect against?', answer: 'Dereferencing p when it is a null pointer', explanation: 'The `&&` operator evaluates its right operand only if the left operand is true. When `p` is null, the comparison fails and `*p` is not evaluated.', difficulty: 'medium' },
  { topic: 'Operators and expressions', question: 'Why is `i = i++ + 1;` not a safe way to increment i?', answer: 'It modifies i without a valid sequencing relationship', explanation: 'The increment and assignment both modify `i` in one full expression without sequencing the modifications relative to each other. Such unsequenced side effects make the behavior undefined.', difficulty: 'difficult' },
  { topic: 'Operators and expressions', question: 'What does the conditional expression `ok ? value : fallback` select?', answer: 'value when ok is nonzero, otherwise fallback', explanation: 'The first operand is evaluated first. Exactly one of the second and third operands is then evaluated, making this useful for selecting a result without evaluating both alternatives.', difficulty: 'easy' },
  { topic: 'Operators and expressions', question: 'What does `x & 1` test for when x is an unsigned integer?', answer: 'Whether the least significant bit is set', explanation: 'Bitwise AND retains only bits set in both operands. AND with one isolates bit zero, which is set for odd unsigned values and clear for even ones.', difficulty: 'medium' },
  { topic: 'Operators and expressions', question: 'What is the safer purpose of `x == 0` compared with relying on a truthy conversion in an API?', answer: 'It explicitly checks equality to zero', explanation: 'C converts scalar values to truth values in conditions, but explicit comparisons can communicate the intended sentinel check and avoid confusing pointer, status-code, and numeric meanings.', difficulty: 'easy' },
  { topic: 'Operators and expressions', question: 'Why is shifting a signed negative integer right not fully portable?', answer: 'The result is implementation-defined', explanation: 'For a negative signed left operand, right-shift behavior is implementation-defined. Use unsigned values for bit manipulation and document the intended width and shift range.', difficulty: 'difficult' },
  { topic: 'Operators and expressions', question: 'What can go wrong with `1 << 31` when `1` has type int?', answer: 'The shift may be undefined because the result is not representable as signed int', explanation: 'The left operand is signed `int`; shifting into or beyond an unrepresentable signed result is not portable and can be undefined. Use an appropriately sized unsigned operand and validate the shift count.', difficulty: 'difficult' },
  { topic: 'Operators and expressions', question: 'What does the comma operator guarantee in `(f(), g())`?', answer: 'f is evaluated before g, and the expression value is g’s value', explanation: 'The comma operator sequences its left operand before its right operand. This differs from commas separating function arguments, whose evaluation order is not specified in the same way.', difficulty: 'difficult' },
  { topic: 'Control flow', question: 'How many times does a `do { ... } while (condition);` body execute at minimum?', answer: 'Once', explanation: 'A `do-while` tests its condition after executing the body. It therefore executes at least once even if the condition is initially false.', difficulty: 'easy' },
  { topic: 'Control flow', question: 'What does `break` do inside a `switch` statement?', answer: 'Exits the nearest enclosing switch', explanation: '`break` transfers control after the nearest enclosing loop or switch. Without it, execution can continue into subsequent switch labels (fall through).', difficulty: 'easy' },
  { topic: 'Control flow', question: 'Why should every `switch` handling an enum consider a default or all enumerators?', answer: 'To handle unexpected or newly added values deliberately', explanation: 'An enum object can still contain values outside named enumerators, and future enum additions can make an old switch incomplete. A deliberate default or exhaustive handling prevents accidental behavior.', difficulty: 'medium' },
  { topic: 'Control flow', question: 'What happens when a `continue` executes in a `for` loop?', answer: 'Control proceeds to the iteration expression, then the condition is checked', explanation: 'In a `for` loop, `continue` skips the remainder of the body but does not skip the iteration expression. This is different from a `while` loop, where control returns to its condition.', difficulty: 'medium' },
  { topic: 'Control flow', question: 'Why is `while (scanf("%d", &n) == 1)` safer than `while (!feof(stdin))` for input?', answer: 'It loops only when the conversion actually succeeds', explanation: '`feof` becomes true only after an attempted read reaches end-of-file. Testing the input operation’s return value prevents processing stale or uninitialized data after a failed conversion.', difficulty: 'medium' },
  { topic: 'Control flow', question: 'In nested loops, which loop does an unlabeled `break` exit?', answer: 'Only the innermost loop', explanation: 'C has no labeled break statement. To exit multiple nested loops, use a helper function return, a state flag, or restructure the loops for clarity.', difficulty: 'easy' },
  { topic: 'Control flow', question: 'What risk occurs if a `case` label declares a variable without a scoped compound block?', answer: 'Control can jump to another case across an initialization or into an invalid scope', explanation: 'Case labels do not create scopes by themselves. Bracing each case’s declarations prevents accidental jumps across declarations and limits names to the intended branch.', difficulty: 'difficult' },
  { topic: 'Control flow', question: 'What is the value of `x` after `if (x = 0) { ... }`?', answer: 'x becomes zero and the condition is false', explanation: 'A single equals sign performs assignment, and the assigned value becomes the condition value. Use `==` for comparison and enable compiler warnings to catch suspicious assignments.', difficulty: 'easy' },
  { topic: 'Control flow', question: 'Why can a `goto` within one function be appropriate for cleanup in C?', answer: 'It can centralize cleanup after several failure paths', explanation: 'A forward jump to a cleanup label can release resources acquired in stages without duplicated cleanup code. It should remain local and structured; arbitrary jumps make control flow difficult to reason about.', difficulty: 'medium' },
  { topic: 'Control flow', question: 'What is the key condition for a loop to terminate?', answer: 'Its controlling state must eventually make the continuation condition false', explanation: 'A loop can run forever if its state never changes toward termination or if the condition remains true. Check initialization, update logic, and boundary conditions together.', difficulty: 'medium' },
  { topic: 'Functions', question: 'Why should a function prototype be visible before a call?', answer: 'The compiler needs the function’s parameter and return types to check the call', explanation: 'A declaration provides the function type so the compiler can diagnose incompatible arguments and conversions. Modern C does not permit implicit function declarations.', difficulty: 'easy' },
  { topic: 'Functions', question: 'What does C pass to a function when an array is used as a parameter?', answer: 'A pointer to the first element', explanation: 'An array parameter is adjusted to a pointer parameter. The callee cannot discover the original array length from that pointer, so pass a length separately.', difficulty: 'medium' },
  { topic: 'Functions', question: 'How can a function modify a caller’s integer variable?', answer: 'Receive a pointer to it and assign through the pointer', explanation: 'C passes arguments by value, including pointer values. Passing the object’s address gives the function a copied pointer through which it can modify the original object.', difficulty: 'easy' },
  { topic: 'Functions', question: 'Why must a function not return the address of one of its non-static local variables?', answer: 'The local object’s lifetime ends when the function returns', explanation: 'The returned pointer would refer to an object whose lifetime has ended, producing an indeterminate dangling pointer. Return a value, caller-provided storage, or appropriately managed allocated memory instead.', difficulty: 'medium' },
  { topic: 'Functions', question: 'What is the base case’s role in a recursive function?', answer: 'It stops recursive calls for a solved or smallest input', explanation: 'Without a reachable base case, recursion continues until resources are exhausted. Each recursive step must also move toward that base case.', difficulty: 'easy' },
  { topic: 'Functions', question: 'What does `static` on a function definition at file scope primarily do?', answer: 'Gives the function internal linkage to that translation unit', explanation: 'A file-scope `static` function is not visible by that external name from other translation units. This helps keep implementation helpers private.', difficulty: 'difficult' },
  { topic: 'Functions', question: 'What is the purpose of a `void` parameter list in `int read_value(void)`?', answer: 'It declares that the function accepts no parameters', explanation: 'In a function prototype, `(void)` explicitly specifies zero parameters. An empty parameter list in older C forms does not provide the same strict prototype information.', difficulty: 'medium' },
  { topic: 'Functions', question: 'Why must callers agree on a variadic function’s fixed parameters and format string?', answer: 'The callee relies on the format to interpret promoted arguments', explanation: 'Variadic arguments have no automatic runtime type tags. A format/type mismatch such as passing a `long` for `%d` causes undefined behavior.', difficulty: 'difficult' },
  { topic: 'Functions', question: 'What does `return;` mean inside a function declared with return type void?', answer: 'Return to the caller without a value', explanation: 'A void function communicates results through side effects or output parameters rather than a returned expression. A value-returning function must return a compatible value on its paths.', difficulty: 'easy' },
  { topic: 'Functions', question: 'Why should a function that allocates memory document who frees it?', answer: 'Ownership must be clear to prevent leaks and double frees', explanation: 'Dynamic storage persists beyond a function call until released. An API contract should state whether ownership transfers, remains with the callee, or is supplied by the caller.', difficulty: 'medium' },
  { topic: 'Arrays and strings', question: 'How many elements are in `int a[8];`?', answer: '8', explanation: 'The declared bound is the number of elements, indexed from zero through seven. Accessing `a[8]` is outside the array and has undefined behavior.', difficulty: 'easy' },
  { topic: 'Arrays and strings', question: 'What character terminates a valid C string?', answer: 'The null character `\\0`', explanation: 'String functions scan until the first zero-valued character. Character arrays used as strings need room for this terminator in addition to their visible characters.', difficulty: 'easy' },
  { topic: 'Arrays and strings', question: 'What is wrong with `char s[3] = "cat";` when s is meant to be a string?', answer: 'There is no space for the terminating null character', explanation: 'The three letters require a fourth array element for `\\0`. A three-element array can hold the characters but not a null-terminated string.', difficulty: 'medium' },
  { topic: 'Arrays and strings', question: 'Why is `strncpy` not guaranteed to null-terminate its destination?', answer: 'It copies at most n characters and pads only when the source ends earlier', explanation: 'If the source length is at least `n`, `strncpy` writes no terminator among the copied bytes. Set the last destination byte explicitly or use a carefully bounded alternative.', difficulty: 'difficult' },
  { topic: 'Arrays and strings', question: 'What is the valid index range of `double values[5];`?', answer: '0 through 4', explanation: 'C arrays use zero-based indexing. The upper bound is exclusive for element access, so the valid condition for an index `i` is `i < 5`.', difficulty: 'easy' },
  { topic: 'Arrays and strings', question: 'Why is `gets(buffer)` unsafe and absent from modern C?', answer: 'It cannot limit input length and may overflow the buffer', explanation: '`gets` has no size argument, so attacker-controlled or simply long input can overwrite adjacent memory. Use `fgets` with the buffer capacity and handle a retained newline.', difficulty: 'medium' },
  { topic: 'Arrays and strings', question: 'What does `strlen("abc")` return?', answer: '3', explanation: '`strlen` counts bytes before the terminating null character, not including it. It requires a valid null-terminated string and cannot safely inspect an unterminated array.', difficulty: 'easy' },
  { topic: 'Arrays and strings', question: 'Why can overlapping source and destination make `memcpy` invalid?', answer: 'The C standard requires non-overlapping regions for memcpy', explanation: 'Overlapping ranges violate `memcpy`’s contract and result in undefined behavior. Use `memmove` when overlap is possible because it handles overlapping regions.', difficulty: 'medium' },
  { topic: 'Arrays and strings', question: 'What is the result of comparing two strings with `==` in C?', answer: 'It compares pointer values, not string contents', explanation: 'String literals and character arrays are not compared character-by-character by `==`. Use `strcmp` and check whether its result is zero for equal contents.', difficulty: 'medium' },
  { topic: 'Arrays and strings', question: 'Why must a two-dimensional array parameter include all but its first bound?', answer: 'The compiler needs inner dimensions to calculate element addresses', explanation: 'A parameter such as `int a[][4]` is adjusted to a pointer to arrays of four integers. Without the inner bound, pointer arithmetic cannot determine row strides.', difficulty: 'difficult' },
  { topic: 'Pointers', question: 'What does the expression `&x` produce for an object x?', answer: 'A pointer to x', explanation: 'The address-of operator forms a pointer whose type is a pointer to the operand’s type. The pointer is valid only while the referenced object remains alive.', difficulty: 'easy' },
  { topic: 'Pointers', question: 'What does `*p = 9;` do when p points to a valid int object?', answer: 'Stores 9 in the pointed-to int object', explanation: 'The unary `*` dereferences a pointer as an lvalue. Dereferencing a null, dangling, misaligned, or otherwise invalid pointer is undefined behavior.', difficulty: 'easy' },
  { topic: 'Pointers', question: 'What does adding 1 to an `int *p` point to?', answer: 'The next int element in the same array object', explanation: 'Pointer arithmetic advances by the size of the pointed-to type. It is defined within an array and one past its end, but the one-past pointer must not be dereferenced.', difficulty: 'medium' },
  { topic: 'Pointers', question: 'When is subtracting two pointers defined in C?', answer: 'When both point into the same array object or one past it', explanation: 'The result is the element distance and has type `ptrdiff_t`. Subtracting unrelated pointers is undefined, even if their numeric addresses appear close.', difficulty: 'difficult' },
  { topic: 'Pointers', question: 'What is the difference between `const int *p` and `int *const p`?', answer: 'The first prevents modification through p; the second prevents changing p itself', explanation: 'In `const int *p`, the pointed-to int is const-qualified through that pointer. In `int *const p`, the pointer object is const after initialization but the int can be modified.', difficulty: 'medium' },
  { topic: 'Pointers', question: 'What is a dangling pointer?', answer: 'A pointer that refers to an object whose lifetime has ended', explanation: 'Using a dangling pointer to access an object is undefined behavior. Clear or replace pointers when their storage is released, while remembering that aliases can also dangle.', difficulty: 'easy' },
  { topic: 'Pointers', question: 'Why should a `void *` be converted only to a suitably aligned object pointer before dereferencing?', answer: 'The address must satisfy the target type’s alignment and representation requirements', explanation: 'A `void *` can hold an object pointer generically, but it does not guarantee every possible typed access is valid. Alignment and effective-type rules still apply.', difficulty: 'difficult' },
  { topic: 'Pointers', question: 'What does `int *p, q;` declare?', answer: 'p is a pointer to int and q is an int', explanation: 'The `*` belongs to each declarator, not globally to the base type. Writing `int *p; int *q;` can be clearer when both are pointers.', difficulty: 'medium' },
  { topic: 'Pointers', question: 'Why is checking `p != NULL` not sufficient before every dereference?', answer: 'A non-null pointer may still be dangling or invalid', explanation: 'Null checks handle only the null case. Correct lifetime, bounds, alignment, and provenance must also be guaranteed by the program’s ownership and indexing logic.', difficulty: 'difficult' },
  { topic: 'Pointers', question: 'What does a pointer to a function allow a program to do?', answer: 'Store and invoke a function address through a compatible function type', explanation: 'Function pointers support callbacks and dispatch tables. The pointed-to function signature must be compatible with the call; incompatible function-pointer calls are undefined.', difficulty: 'medium' },
  { topic: 'Structures and unions', question: 'What operator accesses member `x` from a structure object s?', answer: 'The dot operator: `s.x`', explanation: 'Use `.` when the left operand is a structure or union object. For a pointer to the object, use `->`, which is shorthand for dereferencing then accessing a member.', difficulty: 'easy' },
  { topic: 'Structures and unions', question: 'What does `ptr->member` mean?', answer: 'The same as `(*ptr).member`', explanation: 'The arrow operator accesses a member through a pointer. Parentheses matter in the equivalent form because member selection binds more tightly than unary dereference.', difficulty: 'easy' },
  { topic: 'Structures and unions', question: 'Why can `sizeof(struct S)` exceed the sum of its member sizes?', answer: 'The implementation may insert padding for alignment', explanation: 'Members and the overall structure can include padding so objects meet alignment requirements and arrays of the structure keep each element aligned. Do not assume a wire/file layout from `sizeof`.', difficulty: 'medium' },
  { topic: 'Structures and unions', question: 'What distinguishes a union from a structure in storage?', answer: 'Union members overlap the same storage', explanation: 'A union’s size is sufficient for its largest member, with possible alignment padding. A structure allocates storage for all members, also possibly with padding.', difficulty: 'easy' },
  { topic: 'Structures and unions', question: 'Why is writing one union member and reading another not a portable type-conversion method?', answer: 'The interpretation is implementation-dependent and may violate representation assumptions', explanation: 'C permits inspecting object representations through character types, but reading a different union member is not a general portable numeric conversion. Use explicit conversions or `memcpy` for representation inspection.', difficulty: 'difficult' },
  { topic: 'Structures and unions', question: 'Can a structure be assigned to another structure of the same type?', answer: 'Yes, structure assignment copies the value including its members', explanation: 'Assignment copies the structure value as if its members were copied. If members include pointers, the pointed-to allocations are not deep-copied; both structures then contain pointer values.', difficulty: 'medium' },
  { topic: 'Structures and unions', question: 'What does a bit-field declaration such as `unsigned flag : 1;` specify?', answer: 'A member intended to occupy a one-bit field', explanation: 'Bit-field allocation order, storage unit details, and some type properties are implementation-defined. Bit-fields are useful for compact flags but should not define portable external layouts.', difficulty: 'medium' },
  { topic: 'Structures and unions', question: 'Why is `memcmp` not always a valid way to compare structures?', answer: 'Padding bytes may differ even when member values are equal', explanation: 'Structure padding can contain unspecified values, and member representations may also have subtleties. Compare members explicitly when semantic equality is required.', difficulty: 'difficult' },
  { topic: 'Structures and unions', question: 'What is a tagged union pattern?', answer: 'A union paired with a discriminator that records the active member', explanation: 'The tag lets code determine which union member currently contains a valid value. Every read should follow a tag check to avoid interpreting inactive storage as the wrong type.', difficulty: 'medium' },
  { topic: 'Structures and unions', question: 'Why might a flexible array member be used as the last member of a struct?', answer: 'To allocate a header and variable-length payload together', explanation: 'A flexible array member has incomplete size and must be last. Allocate enough bytes for the header plus the desired element count, with overflow checks before computing the total.', difficulty: 'difficult' },
  { topic: 'Dynamic memory', question: 'What does `malloc(n)` return when allocation succeeds?', answer: 'A suitably aligned pointer to at least n bytes of uninitialized storage', explanation: '`malloc` does not initialize the allocated bytes. Check for a null result before use and release the storage with `free` when ownership ends.', difficulty: 'easy' },
  { topic: 'Dynamic memory', question: 'What does `calloc(count, size)` additionally do compared with malloc?', answer: 'Initializes all allocated bytes to zero', explanation: '`calloc` allocates an array-sized block and sets its bytes to zero. This is not a promise that every possible pointer or floating representation is a semantic null or numeric zero on every implementation.', difficulty: 'medium' },
  { topic: 'Dynamic memory', question: 'Why should allocation code check `count > SIZE_MAX / sizeof *items` before multiplication?', answer: 'To prevent the byte-size calculation from wrapping', explanation: 'Unsigned size arithmetic can wrap to a smaller allocation, after which indexing the intended number of elements would write out of bounds. Validate multiplication before calling the allocator.', difficulty: 'difficult' },
  { topic: 'Dynamic memory', question: 'What happens when `free(NULL)` is called?', answer: 'Nothing; it has no effect', explanation: 'The standard defines `free` with a null pointer as a no-op. A non-null argument must be a pointer returned by an allocation function and not already freed.', difficulty: 'easy' },
  { topic: 'Dynamic memory', question: 'Why is using a pointer after `free(p)` unsafe even if p still contains the old address?', answer: 'The allocated object’s lifetime has ended and storage may be reused', explanation: 'The pointer value does not preserve ownership or object lifetime. Accessing freed storage is undefined; setting the owning pointer to null can reduce accidental reuse but does not clear aliases.', difficulty: 'medium' },
  { topic: 'Dynamic memory', question: 'What is a safe pattern when `realloc` may fail?', answer: 'Store its result in a temporary pointer and replace the original only on success', explanation: 'On failure, `realloc` returns null while the original allocation remains valid. Assigning directly to the owning pointer would lose the only reference and leak the original block.', difficulty: 'difficult' },
  { topic: 'Dynamic memory', question: 'What does `realloc(p, 0)` require for portable code?', answer: 'Avoid relying on its varying historical and standard-version-specific behavior', explanation: 'Zero-size reallocation has portability subtleties across C versions and implementations. Explicitly free when the desired new size is zero and handle the pointer state deliberately.', difficulty: 'difficult' },
  { topic: 'Dynamic memory', question: 'What is a memory leak?', answer: 'Allocated storage that is no longer reachable for release', explanation: 'A leak occurs when all owning references are lost before the allocation is freed. Use clear ownership rules and cleanup paths, especially for partial initialization failures.', difficulty: 'easy' },
  { topic: 'Dynamic memory', question: 'When is it appropriate to free a pointer returned by a helper function?', answer: 'When the API contract transfers ownership to the caller', explanation: 'The caller should free only allocations it owns and only with the matching allocator contract. Never free pointers to automatic storage, static objects, or interior elements of an allocation.', difficulty: 'medium' },
  { topic: 'Dynamic memory', question: 'Why should a linked list free nodes iteratively using the next pointer saved before free?', answer: 'Freeing a node ends its lifetime, so its next member can no longer be read', explanation: 'Save the next-node pointer first, then free the current node and continue. Accessing a member after freeing its containing object is a use-after-free error.', difficulty: 'medium' },
  { topic: 'Preprocessor and headers', question: 'What is the purpose of an include guard in a header?', answer: 'Prevent repeated inclusion from redefining declarations within one translation unit', explanation: 'A macro guard skips the header body after its first inclusion. This avoids duplicate declarations or definitions caused by repeated or indirect inclusion.', difficulty: 'easy' },
  { topic: 'Preprocessor and headers', question: 'Why should a function-like macro parameter used more than once be treated carefully?', answer: 'Its argument expression may be evaluated multiple times', explanation: 'A macro such as `MAX(i++, j++)` can evaluate arguments more than once and produce surprising side effects. Prefer an inline function where type and evaluation behavior matter.', difficulty: 'medium' },
  { topic: 'Preprocessor and headers', question: 'What does `#include <stdio.h>` provide?', answer: 'Declarations for standard input/output facilities such as printf and FILE', explanation: 'Including the standard header makes declarations and macros available to the translation unit. Calling library functions without the proper declaration can cause constraint violations or incorrect assumptions.', difficulty: 'easy' },
  { topic: 'Preprocessor and headers', question: 'What is the difference between `#include "local.h"` and `#include <local.h>` by convention?', answer: 'Quoted form searches local locations first; angle brackets search implementation include locations', explanation: 'The exact search rules are implementation-defined, but the conventional distinction is current/project headers in quotes and system headers in angle brackets.', difficulty: 'medium' },
  { topic: 'Preprocessor and headers', question: 'Why should a macro that expands to multiple statements use a `do { ... } while (0)` wrapper?', answer: 'It behaves syntactically like one statement when followed by a semicolon', explanation: 'The wrapper prevents dangling-else and statement-grouping problems in constructs such as `if (condition) MACRO(); else ...`. It does not create a runtime loop because the condition is false.', difficulty: 'difficult' },
  { topic: 'Preprocessor and headers', question: 'What does conditional compilation with `#ifdef FEATURE` test?', answer: 'Whether FEATURE is defined as a macro', explanation: '`#ifdef` tests definition, not whether the macro’s replacement value is nonzero. Use `#if FEATURE` when testing a numeric macro value.', difficulty: 'easy' },
  { topic: 'Preprocessor and headers', question: 'Why should a header generally declare a function rather than define a non-static external function body?', answer: 'Including the definition in multiple translation units can cause duplicate linker definitions', explanation: 'Headers are commonly included by many source files. Put ordinary external function definitions in one source file, or use carefully designed `static inline` definitions when appropriate.', difficulty: 'medium' },
  { topic: 'Preprocessor and headers', question: 'What does the `#` stringizing operator do inside a function-like macro?', answer: 'Converts the unexpanded argument tokens into a string literal', explanation: 'Stringizing suppresses ordinary macro expansion of that argument before creating the string. Two-level macro patterns are used when expansion before stringizing is desired.', difficulty: 'difficult' },
  { topic: 'Preprocessor and headers', question: 'What does the `##` operator do in a macro replacement list?', answer: 'Pastes adjacent preprocessing tokens into one token', explanation: 'Token pasting is performed during preprocessing and must form a valid preprocessing token. Overusing it makes macros harder to read and debug.', difficulty: 'medium' },
  { topic: 'Preprocessor and headers', question: 'Why can a macro named `min` break unrelated code included later?', answer: 'The preprocessor replaces matching tokens without respecting C scopes', explanation: 'Macro expansion is textual and occurs before compilation. Prefix project-specific macro names or prefer functions to avoid collisions with libraries and identifiers.', difficulty: 'difficult' },
  { topic: 'File input and output', question: 'What does `fopen(path, "r")` request?', answer: 'Open an existing text file for reading', explanation: 'The mode `r` requires the file to exist and opens it for reading. Check whether `fopen` returned null before using the stream.', difficulty: 'easy' },
  { topic: 'File input and output', question: 'Why should `fclose` be called for a successfully opened stream?', answer: 'It releases stream resources and reports some buffered-write errors', explanation: 'Closing flushes output buffers and releases resources. Check the return value when write errors matter because a failure can appear during close.', difficulty: 'medium' },
  { topic: 'File input and output', question: 'What does `fgets(buf, sizeof buf, file)` limit?', answer: 'The maximum number of bytes read into the destination including room for a terminator', explanation: '`fgets` reads at most one less than the supplied size and null-terminates on success. It may retain a newline, and callers should detect truncated lines when necessary.', difficulty: 'easy' },
  { topic: 'File input and output', question: 'Why is `while (!feof(file)) { fscanf(file, ...); }` a common bug?', answer: 'EOF is set only after a read attempt fails', explanation: 'The loop may execute once more with stale data because the previous successful read did not yet set the EOF indicator. Test the input function’s return value in the loop condition.', difficulty: 'medium' },
  { topic: 'File input and output', question: 'What does `fprintf(file, "%zu", count)` use `%zu` for?', answer: 'Formatting a value of type size_t', explanation: 'The `z` length modifier matches the corresponding unsigned integer type used for `size_t`. Format specifiers must match argument types to avoid undefined behavior.', difficulty: 'medium' },
  { topic: 'File input and output', question: 'Why is writing a raw struct with `fwrite(&s, sizeof s, 1, file)` not a portable interchange format?', answer: 'Padding, byte order, and member representations can vary', explanation: 'Raw object bytes depend on ABI and implementation details. Define a serialization format with explicit field widths, byte order, and validation for durable or cross-platform data.', difficulty: 'difficult' },
  { topic: 'File input and output', question: 'What is the purpose of checking `ferror(stream)` after an input loop?', answer: 'Distinguish an I/O error from normal end-of-file', explanation: 'A read can stop because of EOF or because an error occurred. `ferror` lets the program report the latter rather than treating incomplete input as successful.', difficulty: 'medium' },
  { topic: 'File input and output', question: 'What does `remove(filename)` attempt to do?', answer: 'Delete the named file according to the host environment rules', explanation: '`remove` can remove a file and, on some systems, an empty directory. Check its return value; permissions and filesystem conditions can cause failure.', difficulty: 'easy' },
  { topic: 'File input and output', question: 'Why can mixing `scanf` and `fgets` appear to skip a line?', answer: 'scanf may leave the newline in the input stream', explanation: '`fgets` then reads the pending newline immediately. Prefer line-based input followed by parsing, or deliberately consume and validate the remainder of the line.', difficulty: 'medium' },
  { topic: 'File input and output', question: 'What should a program do if `fwrite` returns fewer items than requested?', answer: 'Treat it as a short write and handle the error or retry as appropriate', explanation: 'A short write can indicate an I/O error or limited progress. Check the stream error state and ensure the application does not report a complete save when bytes were not written.', difficulty: 'difficult' },
  { topic: 'Scope and storage duration', question: 'What is the lifetime of an ordinary automatic local variable?', answer: 'From entry into its block until control leaves that block', explanation: 'An automatic object normally ceases to exist when its block ends. Returning its address creates a dangling pointer.', difficulty: 'easy' },
  { topic: 'Scope and storage duration', question: 'What changes when a block-scope variable is declared `static`?', answer: 'It retains its value and storage duration for the entire program execution', explanation: 'A block-scope static object has static storage duration but block scope. Its initializer must be a constant expression in C, and it is initialized once.', difficulty: 'medium' },
  { topic: 'Scope and storage duration', question: 'What is the difference between scope and storage duration?', answer: 'Scope determines where a name is visible; storage duration determines an object’s lifetime', explanation: 'A name can be local in scope while its object persists for the entire program, as with a block-scope static. Keeping the concepts separate clarifies lifetime bugs.', difficulty: 'medium' },
  { topic: 'Scope and storage duration', question: 'What does `extern int total;` usually declare?', answer: 'An object defined elsewhere with external linkage', explanation: '`extern` generally declares an object without allocating its definition in that translation unit. A compatible definition must exist in the program when the object is used.', difficulty: 'medium' },
  { topic: 'Scope and storage duration', question: 'Why must a file-scope object definition usually appear only once across a program?', answer: 'Multiple external definitions can violate the one-definition requirements and cause linker errors', explanation: 'Headers should usually contain `extern` declarations, while one source file provides the definition. `static` file-scope objects are separate internal-linkage objects instead.', difficulty: 'difficult' },
  { topic: 'Scope and storage duration', question: 'What is the value of an uninitialized automatic `int x;`?', answer: 'Indeterminate', explanation: 'Reading an uninitialized automatic object can yield an indeterminate value and may trigger undefined behavior. Initialize objects before using them.', difficulty: 'easy' },
  { topic: 'Scope and storage duration', question: 'How are objects with static storage duration initialized when no initializer is supplied?', answer: 'They are initialized to zero values', explanation: 'Static-storage objects receive zero initialization before program startup. This differs from uninitialized automatic objects, which have indeterminate values.', difficulty: 'medium' },
  { topic: 'Scope and storage duration', question: 'What is a translation unit in C?', answer: 'A source file after preprocessing, including included headers', explanation: 'The preprocessor expands includes and macros to form a translation unit, which is then compiled. Linkage connects declarations and definitions across translation units.', difficulty: 'medium' },
  { topic: 'Scope and storage duration', question: 'What is internal linkage?', answer: 'A name can be referred to only within its translation unit', explanation: 'File-scope `static` functions and objects commonly have internal linkage. This prevents their names from colliding with external names in other source files.', difficulty: 'difficult' },
  { topic: 'Scope and storage duration', question: 'Why can a pointer to a block-scope static object remain valid after the function returns?', answer: 'The object has static storage duration and remains alive for the program', explanation: 'Its name is out of scope after return, but the object lifetime continues. Returning its address is valid if the API clearly describes shared state and synchronization needs.', difficulty: 'difficult' },
  { topic: 'Errors, undefined behavior and tools', question: 'What is undefined behavior in C?', answer: 'Behavior for which the C standard imposes no requirements', explanation: 'Undefined behavior can produce arbitrary outcomes, not merely a predictable crash. Avoid it through bounds checks, valid lifetimes, type-correct formats, and compiler diagnostics.', difficulty: 'easy' },
  { topic: 'Errors, undefined behavior and tools', question: 'Why should a C program enable compiler warnings during development?', answer: 'Warnings can identify suspicious conversions, declarations and control flow early', explanation: 'Warnings are not proof of correctness, but they often catch uninitialized values, format mismatches, missing returns, and accidental assignments before runtime testing.', difficulty: 'easy' },
  { topic: 'Errors, undefined behavior and tools', question: 'What class of bugs can AddressSanitizer help detect during testing?', answer: 'Memory errors such as out-of-bounds access and use-after-free', explanation: 'AddressSanitizer instruments memory accesses to detect several runtime memory-safety violations. It complements tests and static analysis but cannot prove a program is free of defects.', difficulty: 'medium' },
  { topic: 'Errors, undefined behavior and tools', question: 'Why does a successful compilation not prove a C program is correct?', answer: 'Compilation checks syntax and constraints but not all runtime behavior or requirements', explanation: 'A program can compile while containing logic errors, invalid input handling, race conditions, or paths that trigger undefined behavior. Testing and review are still necessary.', difficulty: 'easy' },
  { topic: 'Errors, undefined behavior and tools', question: 'What can happen when signed integer overflow occurs in C?', answer: 'Undefined behavior', explanation: 'Unlike unsigned wraparound, signed overflow is not defined by the language. Check ranges before arithmetic or use an appropriate unsigned or wider representation with explicit limits.', difficulty: 'medium' },
  { topic: 'Errors, undefined behavior and tools', question: 'Why is `printf(user_input);` unsafe when user_input is untrusted?', answer: 'The input is interpreted as a format string', explanation: 'Format directives can read arguments that were not supplied and may expose data or cause memory corruption. Use `printf("%s", user_input)` to print it as data.', difficulty: 'difficult' },
  { topic: 'Errors, undefined behavior and tools', question: 'What should be checked when a function returns an error code and writes through an output pointer?', answer: 'Check the return status before using the output object', explanation: 'On failure the function may leave output storage unchanged or set only a documented subset. Follow the API contract and initialize outputs when that reduces risk.', difficulty: 'medium' },
  { topic: 'Errors, undefined behavior and tools', question: 'Why is relying on a particular evaluation order for function arguments nonportable?', answer: 'C does not generally specify the order in which arguments are evaluated', explanation: 'Side effects in separate arguments can occur in an unspecified order. Compute side-effecting values in separate statements before calling the function.', difficulty: 'difficult' },
  { topic: 'Errors, undefined behavior and tools', question: 'What is the purpose of a minimal reproducible test case when debugging?', answer: 'Isolate the smallest input and code path that still demonstrates the defect', explanation: 'Reducing unrelated state makes the failure easier to reason about and share. It helps distinguish a language/runtime issue from an application-specific interaction.', difficulty: 'medium' },
  { topic: 'Errors, undefined behavior and tools', question: 'Why should external input be validated before converting it with `atoi`?', answer: 'atoi does not report conversion errors or overflow reliably', explanation: '`strtol` provides an end pointer and range reporting through `errno`, allowing callers to reject malformed or out-of-range values. Always validate the entire intended input.', difficulty: 'difficult' },
];

const cDistractors: Record<string, string[]> = {
  'Types and declarations': [
    'It changes the object lifetime to static storage duration',
    'It makes every access to the object atomic',
    'It guarantees the object is stored in a CPU register',
    'It converts the declared object into a pointer',
    'A C byte is required to contain exactly eight bits',
  ],
  'Operators and expressions': [
    'The expression is grouped from right to left in every case',
    'All operands are evaluated in an order chosen by the programmer',
    'Signed arithmetic always wraps modulo the type width',
    'A bitwise operator short-circuits its right operand',
    'The shift count is automatically reduced to the type width',
  ],
  'Control flow': [
    'The body is skipped whenever the condition is false before entry',
    'break exits every enclosing loop and switch',
    'continue terminates the entire function',
    'EOF is set before the first read attempt',
    'case labels create a separate scope automatically',
  ],
  Functions: [
    'C passes every argument by reference automatically',
    'An array argument carries its length with the pointer',
    'A local automatic object remains alive after its function returns',
    'The linker checks each argument value at runtime',
    'A function pointer can call any function regardless of signature',
  ],
  'Arrays and strings': [
    'C array indices begin at one',
    'strlen includes the terminating null character in its count',
    'All character arrays are automatically null-terminated',
    'memcpy handles overlapping ranges safely',
    'strcmp returns zero when two strings are different',
  ],
  Pointers: [
    'Pointer arithmetic advances by one byte for every pointer type',
    'A non-null pointer is always safe to dereference',
    'Subtracting pointers to unrelated objects is always defined',
    'free automatically clears every copy of a pointer',
    'A pointer stores the length of the allocation it refers to',
  ],
  'Structures and unions': [
    'A structure has no padding on any conforming implementation',
    'Every union member occupies separate storage',
    'memcmp always compares semantic structure member values',
    'Structure assignment deep-copies memory referenced by pointer members',
    'Bit-field order in memory is identical on every platform',
  ],
  'Dynamic memory': [
    'malloc returns memory initialized to semantic zero values',
    'free can be called repeatedly on the same non-null pointer',
    'realloc failure always frees the original allocation',
    'Unsigned allocation-size multiplication cannot overflow',
    'A successful allocation remains valid after it is freed',
  ],
  'Preprocessor and headers': [
    'The preprocessor understands C block scope when replacing macros',
    'A macro argument with side effects is evaluated exactly once',
    'Angle-bracket includes always search the current directory first',
    'Every function definition belongs in a header',
    'Token pasting performs a runtime string concatenation',
  ],
  'File input and output': [
    'fopen with mode r creates a missing file for writing',
    'fgets reads an unlimited line regardless of buffer size',
    'feof becomes true before an attempted read reaches end-of-file',
    'Raw structure bytes have a portable byte order and layout',
    'fclose cannot report a buffered output failure',
  ],
  'Scope and storage duration': [
    'Scope and object lifetime mean the same thing',
    'An uninitialized automatic integer is guaranteed to be zero',
    'A block-scope static object is destroyed when the block exits',
    'extern always allocates a new independent object',
    'Every file-scope name has external linkage',
  ],
  'Errors, undefined behavior and tools': [
    'Undefined behavior has one stable result on all compilers',
    'Successful compilation proves all input cases are correct',
    'Signed integer overflow is defined to wrap around',
    'A format string can safely be taken directly from untrusted input',
    'Warnings guarantee that no runtime defects remain',
  ],
};

function stableId(track: DegreeTrack, subject: string, question: string): string {
  const identity = `${track}\u0000${subject}\u0000${question.normalize('NFKC').toLowerCase()}`;
  let hash = 2166136261;
  for (let index = 0; index < identity.length; index += 1) hash = Math.imul(hash ^ identity.charCodeAt(index), 16777619);
  return `degree-${track}-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function buildCQuestions(): PracticeQuestion[] {
  let promotedMediumCount = 0;
  return cQuestions.slice(0, 100).map((item, index) => {
    const difficulty = item.difficulty === 'medium' && promotedMediumCount < 3
      ? (promotedMediumCount += 1, 'difficult' as const)
      : item.difficulty;
    const optionPool = cDistractors[item.topic] ?? [];
    const uniqueOptions = [...new Set(optionPool)].filter((option) => option !== item.answer);
    const shift = index % Math.max(uniqueOptions.length, 1);
    const incorrect = [...uniqueOptions.slice(shift), ...uniqueOptions.slice(0, shift)].slice(0, 3);
    const options = [item.answer, ...incorrect];
    const rotated = [...options.slice(index % 4), ...options.slice(0, index % 4)];
    return {
      id: stableId('degree-it', 'C', item.question),
      track: 'degree-it',
      subject: 'C',
      chapter: null,
      topic: item.topic,
      question_type: 'single_choice',
      language: null,
      language_category: null,
      difficulty,
      question: item.question,
      options: rotated,
      correct_index: rotated.indexOf(item.answer),
      explanation: item.explanation,
      year_asked: null,
      source_type: 'generated',
      source_name: 'Original C programming practice questions',
      source_url: null,
      source_verified_at: null,
      research_reference: 'Original educational practice based on standard C language knowledge; not an official examination question.',
    };
  });
}

const localBanks = new Map<string, PracticeQuestion[]>([
  ['degree-it:C', buildCQuestions()],
]);

export function getDegreeCoursePracticeQuestions(track: PracticeTrack, subject: string): PracticeQuestion[] {
  if (
    track !== 'degree-it'
    && track !== 'degree-nonit'
    && track !== 'business-hr'
    && track !== 'business-operations'
    && track !== 'business-management'
  ) return [];
  return [...(localBanks.get(`${track}:${subject}`) ?? [])];
}

export function getDegreeCoursePracticeBankReport(): Array<{ track: DegreeTrack; subject: string; count: number }> {
  return [...localBanks.entries()].map(([key, questions]) => {
    const [track, subject] = key.split(':');
    return { track: track as DegreeTrack, subject, count: questions.length };
  });
}

export function getDegreeCourseActivityQuestionIds(
  track: PracticeTrack,
  subject: string,
  activity: 'learn' | 'assignment' | 'mock',
  availableQuestions: readonly PracticeQuestion[] = [],
): Set<string> | null {
  const localQuestions = localBanks.get(`${track}:${subject}`) ?? [];
  const questions = localQuestions.length >= 100 ? localQuestions : [...availableQuestions];
  if (questions.length < 100) return null;
  const activityBank = [...questions].sort((left, right) => left.id.localeCompare(right.id)).slice(0, 100);

  const select = (difficulty: PracticeQuestion['difficulty'], count: number, excluded: Set<string>) => {
    const selected = activityBank
      .filter((question) => question.difficulty === difficulty && !excluded.has(question.id))
      .slice(0, count);
    selected.forEach((question) => excluded.add(question.id));
    return selected;
  };
  const mockIds = new Set<string>();
  select('difficult', 10, mockIds);
  select('easy', 5, mockIds);
  select('medium', 5, mockIds);
  if (mockIds.size !== 20) return null;

  const assignmentIds = new Set(mockIds);
  select('difficult', 18, assignmentIds);
  select('easy', 12, assignmentIds);
  if (assignmentIds.size !== 50) return null;

  if (activity === 'mock') return mockIds;
  if (activity === 'assignment') {
    return new Set([...assignmentIds].filter((id) => !mockIds.has(id)));
  }
  return new Set(activityBank.map((question) => question.id).filter((id) => !assignmentIds.has(id)));
}
