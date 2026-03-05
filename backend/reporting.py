import matplotlib.pyplot as plt

def generate_report(equity_curve):

    plt.figure(figsize=(10, 5))
    plt.plot(equity_curve)
    plt.title("Equity Curve")
    plt.xlabel("Trades")
    plt.ylabel("Equity")
    plt.grid()
    plt.show()