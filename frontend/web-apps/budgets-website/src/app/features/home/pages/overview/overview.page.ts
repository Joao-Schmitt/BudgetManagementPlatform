import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardTableImports } from '@/shared/components/table/table.imports';

type QuickActionTone = 'primary' | 'neutral' | 'outline';

interface SummaryCard {
  label: string;
  value: string;
  trend: string;
  tone: 'highlight' | 'default';
}

interface QuickAction {
  title: string;
  description: string;
  tone: QuickActionTone;
}

interface RecentBudget {
  code: string;
  client: string;
  owner: string;
  amount: string;
  status: 'Aprovado' | 'Pendente' | 'Em analise';
  updatedAt: string;
}

@Component({
  selector: 'app-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ZardBadgeComponent, ZardButtonComponent, ZardCardComponent, ZardTableImports],
  templateUrl: './overview.page.html',
  styleUrl: './overview.page.scss'
})
export class OverviewPage {
  protected readonly summaryCards: SummaryCard[] = [
    { label: 'Orcamentos do mes', value: '248', trend: '+14% vs. ultimo mes', tone: 'highlight' },
    { label: 'Orcamentos pendentes', value: '37', trend: '12 aguardando retorno hoje', tone: 'default' },
    { label: 'Clientes ativos', value: '1.284', trend: '84 novos no ciclo atual', tone: 'default' },
    { label: 'Taxa de conversao', value: '32,4%', trend: '+2,1 p.p. no trimestre', tone: 'default' }
  ];

  protected readonly quickActions: QuickAction[] = [
    {
      title: 'Novo orcamento',
      description: 'Iniciar proposta comercial com dados resumidos do cliente.',
      tone: 'primary'
    },
    {
      title: 'Cadastrar cliente',
      description: 'Abrir fluxo rapido de novo cliente e contatos principais.',
      tone: 'neutral'
    },
    {
      title: 'Exportar relatorio',
      description: 'Gerar consolidado operacional do periodo atual.',
      tone: 'outline'
    }
  ];

  protected readonly recentBudgets: RecentBudget[] = [
    {
      code: 'ORC-2048',
      client: 'Grupo Atlas',
      owner: 'Mariana Costa',
      amount: 'R$ 84.200',
      status: 'Pendente',
      updatedAt: 'Hoje, 14:20'
    },
    {
      code: 'ORC-2042',
      client: 'Nova Linha Logistica',
      owner: 'Rafael Dias',
      amount: 'R$ 126.800',
      status: 'Aprovado',
      updatedAt: 'Hoje, 10:05'
    },
    {
      code: 'ORC-2038',
      client: 'Hospital Solaris',
      owner: 'Beatriz Lima',
      amount: 'R$ 48.900',
      status: 'Em analise',
      updatedAt: 'Ontem, 18:42'
    },
    {
      code: 'ORC-2031',
      client: 'Construtora Vértice',
      owner: 'Lucas Prado',
      amount: 'R$ 212.500',
      status: 'Pendente',
      updatedAt: 'Ontem, 15:17'
    }
  ];

  protected quickActionType(tone: QuickActionTone): 'default' | 'secondary' | 'outline' {
    switch (tone) {
      case 'primary':
        return 'default';
      case 'outline':
        return 'outline';
      default:
        return 'secondary';
    }
  }

  protected statusType(status: RecentBudget['status']): 'default' | 'secondary' | 'destructive' {
    switch (status) {
      case 'Aprovado':
        return 'default';
      case 'Pendente':
        return 'secondary';
      default:
        return 'destructive';
    }
  }
}
