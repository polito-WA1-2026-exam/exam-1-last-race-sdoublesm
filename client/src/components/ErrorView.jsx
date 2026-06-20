function ErrorView({ title, subtitle }) {
	<div className="container p-5 text-center">
		<div className="bg-dark text-white p-5 rounded-4 shadow-lg border">
			<i className="bi bi-x-octagon-fill text-danger fs-1"></i>
			<h2>{title}</h2>
			<p className="text-secondary mb-4 fs-5">{subtitle}</p>
		</div>
	</div>;
}

export default ErrorView;
