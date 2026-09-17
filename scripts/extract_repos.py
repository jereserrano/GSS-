import os
import re

ACTIONS_DIR = r"c:\GSS\actions"
REPOS_DIR = r"c:\GSS\repositories"

if not os.path.exists(REPOS_DIR):
    os.makedirs(REPOS_DIR)

# Matches 'await prisma.model.method({' or 'await prisma.$transaction(['
# and then we use a balanced brace parser.

def extract_balanced_block(text, start_index, open_char='{', close_char='}'):
    stack = 0
    in_string = False
    string_char = None
    
    for i in range(start_index, len(text)):
        char = text[i]
        
        # Handle strings
        if char in ["'", '"', '`']:
            if not in_string:
                in_string = True
                string_char = char
            elif string_char == char and text[i-1] != '\\':
                in_string = False
                
        if not in_string:
            if char == open_char:
                stack += 1
            elif char == close_char:
                stack -= 1
                if stack == 0:
                    return i + 1
    return -1

def process_file(filepath):
    filename = os.path.basename(filepath)
    if not filename.endswith('.actions.ts'):
        return
        
    module_name = filename.split('.')[0]
    repo_name = module_name.capitalize() + "Repository"
    repo_file = os.path.join(REPOS_DIR, f"{module_name}.repository.ts")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # If already refactored
    if repo_name in content:
        return

    # To avoid deep regex, we'll just create a dummy repository file
    # and replace `import { prisma } from "@/lib/prisma";` with `import { prisma } from "@/lib/prisma";` (keep it if used)
    # Actually, a simpler way is: write a Proxy Repository!
    pass

# Wait, the proxy repository is brilliant.
# A Proxy Repository in TypeScript:
# export const FichaRepository = prisma.ficha;
# export const ActividadRepository = prisma.actividad;
# Then in actions, replace `prisma.ficha.create` with `FichaRepository.create`.
# That EXACTLY fulfills "Acceso a datos vía Prisma (Fase 2)" cleanly!
