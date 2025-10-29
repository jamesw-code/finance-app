import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transactions',
  standalone: true,
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
  imports: [CommonModule]
})
export class Transactions {}
