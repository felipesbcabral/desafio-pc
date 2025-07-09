import { NgModule } from '@angular/core';
import { LucideAngularModule, TrendingUp, TrendingDown, DollarSign, AlertTriangle, FileText, Calendar, Clock, Plus, Search, Menu, Bell, User, ChevronDown, ChevronLeft, ChevronRight, LogOut, Info, LayoutDashboard, PlusCircle, Eye, EyeOff, Edit, Trash2, RefreshCw, X, Loader2, AlertCircle, ArrowLeft, ArrowRight, Check, Mail, Handshake } from 'lucide-angular';

@NgModule({
  imports: [LucideAngularModule.pick({
    TrendingUp,
    TrendingDown,
    DollarSign,
    AlertTriangle,
    FileText,
    Calendar,
    Clock,
    Plus,
    Search,
    Menu,

    Bell,
    User,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Info,
    LayoutDashboard,
    PlusCircle,
    Eye,
    EyeOff,
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
    Handshake,

  })],
  exports: [LucideAngularModule]
})
export class LucideIconsModule {}