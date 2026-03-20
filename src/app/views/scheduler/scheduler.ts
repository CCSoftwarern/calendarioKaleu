import { Component, signal, ChangeDetectorRef, inject, OnInit  } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { CommonModule } from '@angular/common';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { Xano } from '../../services/xano.js';
import { Evento } from '../../models/modelEvent.js';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';


@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [ FullCalendarModule, CommonModule, Dialog, ButtonModule, InputTextModule ],
  templateUrl: './scheduler.html',
  styleUrl: './scheduler.css',
})
export class Scheduler implements OnInit{
  private xanoService = inject(Xano);
  dados: Evento[] = [];
  loading: boolean = false;
  mensagemErro: string = '';
  visible: boolean = false;


  ngOnInit(): void {
   this.xanoService.getData().subscribe((dados: Evento[]) => {
      
      // Converte seu Model para o formato do FullCalendar (EventInput)
      const eventosParaCalendario: EventInput[] = dados.map(item => ({
        id: String(item.id),
        title: item.title, // De 'titulo_projeto' para 'title'
        start: item.start, // O FullCalendar aceita ISO string ou Date object
        extendedProps: {
          descricao: item.nm_cliente // Dados extras que não são padrão do calendário
        }
      }));

      // Atualiza o estado do calendário
      this.calendarOptions.update(options => ({
        ...options,
        events: eventosParaCalendario
      }));
    });
  }

  calendarVisible = signal(true);
  calendarOptions = signal<CalendarOptions>({
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
      bootstrap5Plugin,
    ],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    locale: ptBrLocale,
    initialView: 'dayGridMonth',
    events: [] ,
    themeSystem: 'bootstrap5',
    // initialEvents: this.INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this)
    /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */
  });

  currentEvents = signal<EventApi[]>([]);


  
  constructor(private changeDetector: ChangeDetectorRef) {
  }


    handleCalendarToggle() {
    this.calendarVisible.update((bool) => !bool);
  }

  handleWeekendsToggle() {
    this.calendarOptions.update((options) => ({
      ...options,
      weekends: !options.weekends,
    }));
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const title = prompt('Digite o nome do evento:');
    this.visible = true;
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      // 1. Criamos o objeto conforme seu Model do Xano
      const novoEventoParaXano = {
        title: title,
        start: selectInfo.startStr, // Formato ISO "YYYY-MM-DD"
        nm_cliente: 'Claudemyr',
      };
       // 2. Enviamos para o Xano
      this.xanoService.addEvent(novoEventoParaXano).subscribe({
        next: (eventoSalvo) => {
          // 3. Se salvou no Xano, adicionamos visualmente no calendário
          calendarApi.addEvent({
            id: String(eventoSalvo.id),
            title: eventoSalvo.title,
            start: eventoSalvo.start,
            allDay: selectInfo.allDay
          });
          alert('Evento salvo no Xano com sucesso!');
        },
        error: (err) => alert('Erro ao salvar no Xano: ' + err.message)
      });
    }
  }


  handleEventClick(clickInfo: EventClickArg) {
    const idDoEvento = clickInfo.event.id;
   if (confirm(`Tem certeza que deseja excluir o evento '${clickInfo.event.title}'?`)) {
      // 1. Chama o Xano para deletar no Banco de Dados
      this.xanoService.deleteEvent(idDoEvento).subscribe({
        next: () => {
          // 2. Se deletou no Xano, remove visualmente do FullCalendar
          clickInfo.event.remove(); 
          alert('Evento removido com sucesso!');
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao excluir no Xano.');
        }
      });
    }
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
  }

onGetEventos() {
  this.loading = true;

  this.xanoService.getData().subscribe({
    next: (response) => {
      this.dados = response;

      console.log(this.dados);
    },

    error: (err) => {
      console.error('Erro ao carregar eventos:', err);
      this.mensagemErro = 'Erro ao carregar dados';
    },

    complete: () => {
      this.loading = false;
    }
  });
}

position: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'center';
    showDialog(position: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright') {
        this.position = position;
        this.visible = true;
    }

}
