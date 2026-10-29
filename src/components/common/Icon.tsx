import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Activity,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Check,
  Sliders,
  RefreshCw,
  Download,
  FileText,
  Radio,
  Wifi,
  WifiOff,
  CircuitBoard,
  Gauge,
  BarChart2,
  Terminal,
  X,
  Search,
  SearchX,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronsLeft,
  ChevronsRight,
  Zap,
  Droplets,
  Fan,
  Wind,
  Tractor,
  RotateCw,
  User,
  Award,
  Brain,
  ThumbsUp,
  Clock,
  Factory,
  PlusCircle,
  MoveRight,
  Thermometer,
  LineChart,
  HelpCircle,
  Menu,
} from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({ name, className = '', size = 20 }) => {
  const numSize = typeof size === 'number' ? size : parseInt(size, 10) || 20;

  switch (name) {
    case 'dashboard':
      return <LayoutDashboard size={numSize} className={className} />;
    case 'precision_manufacturing':
      return <Cpu size={numSize} className={className} />;
    case 'monitoring':
      return <Activity size={numSize} className={className} />;
    case 'query_stats':
      return <TrendingUp size={numSize} className={className} />;
    case 'crisis_alert':
    case 'error_outline':
    case 'error':
      return <AlertCircle size={numSize} className={className} />;
    case 'warning_amber':
    case 'warning':
      return <AlertTriangle size={numSize} className={className} />;
    case 'verified':
    case 'check_circle':
      return <CheckCircle2 size={numSize} className={className} />;
    case 'check':
    case 'done':
      return <Check size={numSize} className={className} />;
    case 'tune':
      return <Sliders size={numSize} className={className} />;
    case 'sync':
      return <RefreshCw size={numSize} className={className} />;
    case 'download':
    case 'file_download':
      return <Download size={numSize} className={className} />;
    case 'description':
      return <FileText size={numSize} className={className} />;
    case 'memory':
      return <Cpu size={numSize} className={className} />;
    case 'sensors':
      return <Radio size={numSize} className={className} />;
    case 'wifi':
      return <Wifi size={numSize} className={className} />;
    case 'wifi_off':
    case 'wifi_tethering_error':
      return <WifiOff size={numSize} className={className} />;
    case 'developer_board':
      return <CircuitBoard size={numSize} className={className} />;
    case 'speed':
      return <Gauge size={numSize} className={className} />;
    case 'equalizer':
      return <BarChart2 size={numSize} className={className} />;
    case 'terminal':
      return <Terminal size={numSize} className={className} />;
    case 'close':
      return <X size={numSize} className={className} />;
    case 'search':
      return <Search size={numSize} className={className} />;
    case 'search_off':
      return <SearchX size={numSize} className={className} />;
    case 'unfold_more':
      return <ChevronsUpDown size={numSize} className={className} />;
    case 'expand_more':
    case 'arrow_drop_down':
      return <ChevronDown size={numSize} className={className} />;
    case 'chevron_right':
      return <ChevronRight size={numSize} className={className} />;
    case 'arrow_forward':
      return <ArrowRight size={numSize} className={className} />;
    case 'arrow_back':
      return <ArrowLeft size={numSize} className={className} />;
    case 'arrow_upward':
      return <ArrowUp size={numSize} className={className} />;
    case 'arrow_downward':
      return <ArrowDown size={numSize} className={className} />;
    case 'keyboard_double_arrow_left':
      return <ChevronsLeft size={numSize} className={className} />;
    case 'keyboard_double_arrow_right':
      return <ChevronsRight size={numSize} className={className} />;
    case 'electric_bolt':
      return <Zap size={numSize} className={className} />;
    case 'water_pump':
      return <Droplets size={numSize} className={className} />;
    case 'mode_fan':
      return <Fan size={numSize} className={className} />;
    case 'cyclone':
      return <Wind size={numSize} className={className} />;
    case 'agriculture':
      return <Tractor size={numSize} className={className} />;
    case 'blender':
      return <RotateCw size={numSize} className={className} />;
    case 'person':
      return <User size={numSize} className={className} />;
    case 'badge':
      return <Award size={numSize} className={className} />;
    case 'psychology':
      return <Brain size={numSize} className={className} />;
    case 'thumb_up':
      return <ThumbsUp size={numSize} className={className} />;
    case 'schedule':
      return <Clock size={numSize} className={className} />;
    case 'factory':
      return <Factory size={numSize} className={className} />;
    case 'add_circle':
      return <PlusCircle size={numSize} className={className} />;
    case 'trending_flat':
      return <MoveRight size={numSize} className={className} />;
    case 'thermostat':
      return <Thermometer size={numSize} className={className} />;
    case 'analytics':
      return <LineChart size={numSize} className={className} />;
    case 'menu':
      return <Menu size={numSize} className={className} />;
    default:
      return <HelpCircle size={numSize} className={className} />;
  }
};

