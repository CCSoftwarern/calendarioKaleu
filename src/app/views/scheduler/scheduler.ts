import { Component, signal, ChangeDetectorRef, inject, OnInit  } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { CommonModule, DatePipe } from '@angular/common';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { Xano } from '../../services/xano.js';
import { Evento } from '../../models/modelEvent.js';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { firstValueFrom } from 'rxjs';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DatePickerModule } from 'primeng/datepicker';
import { InputMaskModule } from 'primeng/inputmask';




@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [ FullCalendarModule, CommonModule, Dialog, ButtonModule, InputTextModule, Toast, DatePipe,ProgressSpinner, ReactiveFormsModule, ColorPickerModule, DatePickerModule, InputMaskModule],
  templateUrl: './scheduler.html',
  styleUrl: './scheduler.css',
   providers: [MessageService]
})
export class Scheduler implements OnInit{
  private xanoService = inject(Xano);
  dados: Evento[] = [];
  loading: boolean = false;
  mensagemErro: string = '';
  visible: boolean = false;
  formEvento!: FormGroup;
  mostrarModal = false;
  selectInfoGlobal: any;
  color: string = '#6466f1';
  mostrarData: boolean = false;
  


  ngOnInit(): void {
   
      this.carregarEventos();
        this.formEvento = this.fb.group({
        title: ['', Validators.required],
        nm_cliente: ['', Validators.required],
        start: [''],
        backgroundColor: ['', Validators.required],
        nm_vendedor:['Não informado',Validators.required],
        telefone_cliente: ['',Validators.required],
        email: ['naoinformado@naoinformado.com.br',[Validators.required, Validators.email]]

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


  
  constructor(private changeDetector: ChangeDetectorRef, private messageService: MessageService, private fb: FormBuilder) {
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

  // handleDateSelect(selectInfo: DateSelectArg) {
  //   const title = prompt('Digite o nome do evento:');
  //   const calendarApi = selectInfo.view.calendar;

  //   calendarApi.unselect(); // clear date selection

  //   if (title) {
  //     // 1. Criamos o objeto conforme seu Model do Xano
  //     const novoEventoParaXano = {
  //       title: title,
  //       start: selectInfo.startStr, // Formato ISO "YYYY-MM-DD"
  //       nm_cliente: 'Claudemyr',
  //     };
  //      // 2. Enviamos para o Xano
  //     this.xanoService.addEvent(novoEventoParaXano).subscribe({
  //       next: (eventoSalvo) => {
  //         // 3. Se salvou no Xano, adicionamos visualmente no calendário
  //         calendarApi.addEvent({
  //           id: String(eventoSalvo.id),
  //           title: eventoSalvo.title,
  //           start: eventoSalvo.start,
  //           allDay: selectInfo.allDay
  //         });
  //        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Evento adicionado', key: 'br', life: 3000 });
  //       },
  //       error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Erro ao salvar no Xano: ' + err.message ,  key: 'br', life: 3000})
  //     });
  //   }
  // }

  handleDateSelect(selectInfo: DateSelectArg) {
  this.selectInfoGlobal = selectInfo;

  this.formEvento.patchValue({
    start: selectInfo.startStr
  });
  this.mostrarData = false;
  this.mostrarModal = true; // abre modal
}

salvarEvento() {
  if (this.formEvento.invalid) return;

  const calendarApi = this.selectInfoGlobal.view.calendar;

  const novoEventoParaXano = this.formEvento.value;

  calendarApi.unselect();

  this.xanoService.addEvent(novoEventoParaXano).subscribe({
    next: (eventoSalvo) => {
      calendarApi.addEvent({
        id: String(eventoSalvo.id),
        title: eventoSalvo.title,
        start: eventoSalvo.start,
        allDay: this.selectInfoGlobal.allDay,
        backgroundColor: eventoSalvo.backgroundColor,
         extendedProps: {
              nm_cliente: eventoSalvo.nm_cliente,
              nm_vendedor: eventoSalvo.nm_vendedor,
              telefone_cliente: eventoSalvo.telefone_cliente,
              email: eventoSalvo.email
  }
      });

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Evento adicionado',
        key: 'br',
        life: 3000
      });
      this.mostrarData = false;
      this.mostrarModal = false;
      this.formEvento.reset();
    },
    error: (err) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao salvar no Xano: ' + err.message,
        key: 'br',
        life: 3000
      });
    }
  });
}


  handleEventClick(clickInfo: EventClickArg) {
    const idDoEvento = clickInfo.event.id;
   if (confirm(`Tem certeza que deseja excluir o evento '${clickInfo.event.title}'?`)) {
      // 1. Chama o Xano para deletar no Banco de Dados
      this.xanoService.deleteEvent(idDoEvento).subscribe({
        next: () => {
          // 2. Se deletou no Xano, remove visualmente do FullCalendar
          clickInfo.event.remove(); 
           this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Evento excluído', key: 'br', life: 3000 });
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Erro ao excluir no Xano: ' + err.message ,  key: 'br', life: 3000})
        }
      });
    }
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
  }


position: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'center';
    showDialog(position: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright') {
        this.position = position;
        this.visible = true;
    }


async carregarEventos() {
  try {
    this.loading = true;

    const dados: Evento[] = await firstValueFrom(
      this.xanoService.getData()
    );

    const eventosParaCalendario: EventInput[] = dados.map(item => ({
      id: String(item.id),
      title: item.title,
      start: item.start,
      backgroundColor: item.backgroundColor,
      extendedProps: {
        nm_cliente: item.nm_cliente,
        nm_vendedor: item.nm_vendedor,
        telefone_cliente: item.telefone_cliente,
        email: item.email
      }
    }));

    this.calendarOptions.update(options => ({
      ...options,
      events: eventosParaCalendario
    }));

  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
  } finally {
    this.loading = false;
  }
}
showMostrarFormData(){
  this.mostrarData = true;
  this.mostrarModal = true;
}

}
