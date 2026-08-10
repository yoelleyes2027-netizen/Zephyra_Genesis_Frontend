const ticketFrame = document.getElementById('ticket-frame');
const ticketViews = {
	venta: './venta-caja.html',
	anulacion: './desactivar-ticket.html',
	devolucion: './devolucion.html',
};

document.querySelectorAll('[data-ticket-view]').forEach((button) => {
	button.addEventListener('click', () => {
		const selectedView = button.dataset.ticketView;
		ticketFrame.src = ticketViews[selectedView];

		document.querySelectorAll('[data-ticket-view]').forEach((tab) => {
			const isSelected = tab === button;
			tab.classList.toggle('active', isSelected);
			tab.setAttribute('aria-selected', String(isSelected));
		});
	});
});
