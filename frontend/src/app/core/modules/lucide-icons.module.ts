import { NgModule } from '@angular/core';
import { LucideAngularModule, Download, TrendingUp, TrendingDown, DollarSign, AlertTriangle, FileText, Calendar, Clock, BarChart3, Plus, Search, Settings, Menu, CreditCard, Bell, User, ChevronDown, ChevronLeft, ChevronRight, LogOut, Info, LayoutDashboard, PlusCircle, Users, Eye, Edit, Trash2, RefreshCw, X, Loader2, AlertCircle, ArrowLeft, ArrowRight, Check, Mail, Handshake } from 'lucide-angular';

@NgModule({
  imports: [LucideAngularModule.pick({
    Download,
    TrendingUp,
    TrendingDown,
    DollarSign,
    AlertTriangle,
    FileText,
    Calendar,
    Clock,
    BarChart3,
    Plus,
    Search,
    Settings,
    Menu,
    CreditCard,
    Bell,
    User,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Info,
    LayoutDashboard,
    PlusCircle,
    Users,
    Eye,
    Edit,
    Trash2,
    RefreshCw,
    X,
    Loader2,
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Check,
    Mail,
    Handshake
  })],
  exports: [LucideAngularModule]
})
export class LucideIconsModule {}