import { Component, OnInit } from '@angular/core';

export interface Order {
  id: string;
  date: Date;
  status: 'Processing' | 'Shipped' | 'Delivered';
  items: { name: string; qty: number; price: number }[];
  total: number;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];

  ngOnInit(): void {
    // Mock orders — replace with real API when orders backend is implemented
    const saved = localStorage.getItem('gogreen_orders');
    this.orders = saved ? JSON.parse(saved) : [];
  }
}
