import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JavaValidatorService {
  
  isValidJavaCode(code: string): boolean {
    if (!code?.trim()) return false;
    
    return (
      this.hasValidClassDeclaration(code) &&
      this.hasBalancedBraces(code) &&
      this.hasBalancedParentheses(code) &&
      this.hasValidImports(code)
    );
  }
  
  private hasValidClassDeclaration(code: string): boolean {
    const classRegex = /^\s*(public|private|protected)?\s*class\s+([a-zA-Z_$][a-zA-Z\d_$]*)\s*(?:extends\s+[a-zA-Z_$][a-zA-Z\d_$]*)?\s*(?:implements\s+[a-zA-Z_$][a-zA-Z\d_$]*(?:\s*,\s*[a-zA-Z_$][a-zA-Z\d_$]*)*)?\s*\{/m;
    return classRegex.test(code);
  }
  
  private hasBalancedBraces(code: string): boolean {
    let balance = 0;
    
    for (let i = 0; i < code.length; i++) {
      if (code[i] === '{') balance++;
      if (code[i] === '}') balance--;
      if (balance < 0) return false;
    }
    
    return balance === 0;
  }
  
  private hasBalancedParentheses(code: string): boolean {
    let balance = 0;
    
    for (let i = 0; i < code.length; i++) {
      if (code[i] === '(') balance++;
      if (code[i] === ')') balance--;
      if (balance < 0) return false;
    }
    
    return balance === 0;
  }
  
  private hasValidImports(code: string): boolean {
    const importLines = code.split('\n')
      .filter(line => line.trim().startsWith('import'));
    
    if (importLines.length === 0) return true;
    
    const importRegex = /^\s*import\s+(?:static\s+)?(?:[a-zA-Z_$][a-zA-Z\d_$]*\.)*[a-zA-Z_$][a-zA-Z\d_$]*(?:\.[*])?\s*;\s*$/;
    
    return importLines.every(line => importRegex.test(line.trim()));
  }
  
  private hasValidSemicolons(code: string): boolean {
    const lines = code.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (this.shouldSkipLine(trimmed)) continue;
      
      if (this.looksLikeStatement(trimmed) && !trimmed.endsWith(';')) {
        return false;
      }
    }
    
    return true;
  }
  
  private shouldSkipLine(line: string): boolean {
    const skipPatterns = [
      line === '',
      line.startsWith('//'),
      line.startsWith('/*'),
      line.startsWith('*'),
      line.startsWith('import'),
      line.startsWith('package'),
      line.endsWith('{'),
      line.endsWith('}'),
      line.includes(' class '),
      /^\s*(public|private|protected|class|if|else|for|while|do|try|catch|finally)\b/.test(line)
    ];
    
    return skipPatterns.some(pattern => pattern);
  }
  
  private looksLikeStatement(line: string): boolean {
    const statementPatterns = [
      /^\s*[a-zA-Z_$][a-zA-Z\d_$]*\s*=/,
      /^\s*[a-zA-Z_$][a-zA-Z\d_$]*\s*\(/,
      /^\s*(?:return|break|continue|throw)\b/,
      /^\s*(?:int|double|float|boolean|char|byte|short|long|String|Object)\s+[a-zA-Z_$]/
    ];
    
    return statementPatterns.some(pattern => pattern.test(line));
  }
}