import { Github, Twitter, Linkedin, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-semibold text-lg">VibeOps</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Enterprise-grade operations dashboard for vibe-coding teams. 
              Manage clients, track security, and streamline deployments across 
              all your AI-assisted development projects.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/mbjorke" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com/mbjorke" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com/in/mbjorke" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-medium mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/ops-guide" className="text-muted-foreground hover:text-foreground transition-colors">
                  Migration Helper
                </a>
              </li>
              <li>
                <a href="/clients" className="text-muted-foreground hover:text-foreground transition-colors">
                  Client Management
                </a>
              </li>
              <li>
                <a href="/repositories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Repository Tracking
                </a>
              </li>
              <li>
                <a href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-medium mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://blueberry.build" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  Blueberry Build
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://uxdb.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  UXDB
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <span className="text-muted-foreground">
                  Contact: hello@blueberry.build
                </span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>
            © {currentYear} <strong>Blueberry Maybe Ab Ltd</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <span className="text-xs bg-muted px-2 py-1 rounded">
              v0.1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
