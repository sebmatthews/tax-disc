      *================================================================*
      * VEDCALC - VEHICLE EXCISE DUTY RATE CALCULATION                 *
      *                                                                *
      * CALLED BY VEDENQ (SCREEN) AND VEDBATCH (BATCH). GIVEN ONE      *
      * VEHICLE, RETURNS THE ANNUAL RATE IN WHOLE POUNDS AND A RULE    *
      * CODE. RATES PER TARIFF TABLE, AMENDED 04/2017.                 *
      *                                                                *
      * UK GOVERNMENT DEMO SERVICE. FICTIONAL. RATES ARE INVENTED.     *
      *                                                                *
      * DATES ARE HELD AS DDMMYY. TWO-DIGIT YEARS ARE WINDOWED:        *
      * 50-99 = 1950-1999, 00-49 = 2000-2049 (Y2K REMEDIATION 1998).   *
      *================================================================*
       IDENTIFICATION DIVISION.
       PROGRAM-ID. VEDCALC.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
      *----------------------------------------------------------------*
      * DATE WORK AREAS                                                *
      *----------------------------------------------------------------*
       01  WS-DATE-IN                 PIC 9(6).
       01  WS-DATE-IN-R REDEFINES WS-DATE-IN.
           05  WS-DI-DD               PIC 99.
           05  WS-DI-MM               PIC 99.
           05  WS-DI-YY               PIC 99.
       01  WS-DATE-OUT                PIC 9(8).
       01  WS-DATE-OUT-R REDEFINES WS-DATE-OUT.
           05  WS-DO-CCYY             PIC 9(4).
           05  WS-DO-MM               PIC 99.
           05  WS-DO-DD               PIC 99.
       01  WS-DATE-OK                 PIC X.
           88  DATE-VALID             VALUE "Y".
           88  DATE-INVALID           VALUE "N".
       01  WS-MAX-DAY                 PIC 99.
       01  WS-REM4                    PIC 9(4).
       01  WS-REM100                  PIC 9(4).
       01  WS-REM400                  PIC 9(4).
       01  WS-QUOT                    PIC 9(4).
       01  WS-DAYS-TABLE.
           05  FILLER                 PIC X(24)
               VALUE "312831303130313130313031".
       01  WS-DAYS-R REDEFINES WS-DAYS-TABLE.
           05  WS-DAYS-IN-MONTH       PIC 99 OCCURS 12.
      *----------------------------------------------------------------*
      * CONVERTED DATES, CCYYMMDD                                      *
      *----------------------------------------------------------------*
       01  WS-FIRST-REG               PIC 9(8).
       01  WS-FIRST-REG-R REDEFINES WS-FIRST-REG.
           05  WS-FR-CCYY             PIC 9(4).
           05  WS-FR-MMDD             PIC 9(4).
       01  WS-LIC-START               PIC 9(8).
       01  WS-LIC-START-R REDEFINES WS-LIC-START.
           05  WS-LS-CCYY             PIC 9(4).
           05  WS-LS-MMDD             PIC 9(4).
       01  WS-FIFTH-ANNIV             PIC 9(8).
       01  WS-FIFTH-ANNIV-R REDEFINES WS-FIFTH-ANNIV.
           05  WS-FA-CCYY             PIC 9(4).
           05  WS-FA-MMDD             PIC 9(4).
       01  WS-AGE-YEARS               PIC S9(4).
      *----------------------------------------------------------------*
      * BANDS AND RATE TABLES                                          *
      *----------------------------------------------------------------*
       01  WS-BAND                    PIC 9.
       01  WS-ERA-B-RATES.
           05  FILLER                 PIC X(35)
               VALUE "00015000350016500220002700038000640".
       01  WS-ERA-B-R REDEFINES WS-ERA-B-RATES.
           05  WS-ERA-B-RATE          PIC 9(5) OCCURS 7.
       01  WS-FIRST-YEAR-RATES.
           05  FILLER                 PIC X(35)
               VALUE "00010001600021000260007000160002700".
       01  WS-FIRST-YEAR-R REDEFINES WS-FIRST-YEAR-RATES.
           05  WS-FIRST-YEAR-RATE     PIC 9(5) OCCURS 7.
       01  WS-CONSTANTS.
           05  WS-ERA-A-END           PIC 9(8) VALUE 20010301.
           05  WS-ERA-B-END           PIC 9(8) VALUE 20170401.
           05  WS-ENG-SMALL-MAX       PIC 9(4) VALUE 1549.
           05  WS-ENG-SMALL-RATE      PIC 9(5) VALUE 210.
           05  WS-ENG-LARGE-RATE      PIC 9(5) VALUE 345.
           05  WS-STANDARD-RATE       PIC 9(5) VALUE 195.
           05  WS-SUPPLEMENT          PIC 9(5) VALUE 425.
           05  WS-SUPP-PRICE-MIN      PIC 9(6) VALUE 40000.
           05  WS-HISTORIC-YEARS      PIC 9(2) VALUE 40.
       LINKAGE SECTION.
       01  LK-VEHICLE.
           05  LK-REG                 PIC X(8).
           05  LK-FIRST-REG           PIC 9(6).
           05  LK-FUEL                PIC X.
               88  FUEL-PETROL        VALUE "P".
               88  FUEL-DIESEL        VALUE "D".
               88  FUEL-ELECTRIC      VALUE "E".
               88  FUEL-VALID         VALUE "P" "D" "E".
           05  LK-CO2                 PIC 9(3).
           05  LK-ENGINE              PIC 9(4).
           05  LK-PRICE               PIC 9(6).
           05  LK-FIRST-LIC           PIC X.
               88  FIRST-LICENCE      VALUE "Y".
               88  FIRST-LIC-VALID    VALUE "Y" "N".
           05  LK-LIC-START           PIC 9(6).
       01  LK-RESULT.
           05  LK-RATE                PIC 9(5).
           05  LK-CODE                PIC X(4).
       PROCEDURE DIVISION USING LK-VEHICLE LK-RESULT.
       0000-MAIN.
           MOVE ZERO   TO LK-RATE
           MOVE SPACES TO LK-CODE
           PERFORM 1000-VALIDATE THRU 1000-EXIT
           IF LK-CODE NOT = SPACES
               GO TO 0000-EXIT
           END-IF
           PERFORM 2000-CALCULATE THRU 2000-EXIT.
       0000-EXIT.
           GOBACK.
      *----------------------------------------------------------------*
      * 1000 - VALIDATION. FIRST ERROR FOUND WINS.                     *
      *----------------------------------------------------------------*
       1000-VALIDATE.
           MOVE LK-FIRST-REG TO WS-DATE-IN
           PERFORM 8000-CONVERT-DATE THRU 8000-EXIT
           IF DATE-INVALID
               MOVE "E01" TO LK-CODE
               GO TO 1000-EXIT
           END-IF
           MOVE WS-DATE-OUT TO WS-FIRST-REG
           MOVE LK-LIC-START TO WS-DATE-IN
           PERFORM 8000-CONVERT-DATE THRU 8000-EXIT
           IF DATE-INVALID
               MOVE "E02" TO LK-CODE
               GO TO 1000-EXIT
           END-IF
           MOVE WS-DATE-OUT TO WS-LIC-START
           IF WS-FIRST-REG > WS-LIC-START
               MOVE "E03" TO LK-CODE
               GO TO 1000-EXIT
           END-IF
           IF NOT FUEL-VALID
               MOVE "E04" TO LK-CODE
               GO TO 1000-EXIT
           END-IF
           IF NOT FIRST-LIC-VALID
               MOVE "E05" TO LK-CODE
               GO TO 1000-EXIT
           END-IF.
       1000-EXIT.
           EXIT.
      *----------------------------------------------------------------*
      * 2000 - RATE CALCULATION. FIRST RULE THAT APPLIES WINS.         *
      *----------------------------------------------------------------*
       2000-CALCULATE.
           COMPUTE WS-AGE-YEARS = WS-LS-CCYY - WS-FR-CCYY
           IF WS-AGE-YEARS NOT < WS-HISTORIC-YEARS
               MOVE ZERO TO LK-RATE
               MOVE "HIST" TO LK-CODE
               GO TO 2000-EXIT
           END-IF
           IF FUEL-ELECTRIC
               MOVE ZERO TO LK-RATE
               MOVE "ELEC" TO LK-CODE
               GO TO 2000-EXIT
           END-IF
           IF WS-FIRST-REG < WS-ERA-A-END
               PERFORM 3000-ERA-A THRU 3000-EXIT
           ELSE
               IF WS-FIRST-REG < WS-ERA-B-END
                   PERFORM 4000-ERA-B THRU 4000-EXIT
               ELSE
                   PERFORM 5000-ERA-C THRU 5000-EXIT
               END-IF
           END-IF.
       2000-EXIT.
           EXIT.
      *----------------------------------------------------------------*
      * 3000 - ERA A, REGISTERED BEFORE 1 MARCH 2001. ENGINE SIZE.     *
      *----------------------------------------------------------------*
       3000-ERA-A.
           IF LK-ENGINE > WS-ENG-SMALL-MAX
               MOVE WS-ENG-LARGE-RATE TO LK-RATE
               MOVE "ENG2" TO LK-CODE
           ELSE
               MOVE WS-ENG-SMALL-RATE TO LK-RATE
               MOVE "ENG1" TO LK-CODE
           END-IF.
       3000-EXIT.
           EXIT.
      *----------------------------------------------------------------*
      * 4000 - ERA B, 1 MARCH 2001 TO 31 MARCH 2017. CO2 BANDS.        *
      *----------------------------------------------------------------*
       4000-ERA-B.
           EVALUATE TRUE
               WHEN LK-CO2 NOT > 100  MOVE 1 TO WS-BAND
               WHEN LK-CO2 NOT > 120  MOVE 2 TO WS-BAND
               WHEN LK-CO2 NOT > 150  MOVE 3 TO WS-BAND
               WHEN LK-CO2 NOT > 170  MOVE 4 TO WS-BAND
               WHEN LK-CO2 NOT > 190  MOVE 5 TO WS-BAND
               WHEN LK-CO2 NOT > 225  MOVE 6 TO WS-BAND
               WHEN OTHER             MOVE 7 TO WS-BAND
           END-EVALUATE
           PERFORM 6000-DIESEL-UPLIFT THRU 6000-EXIT
           MOVE WS-ERA-B-RATE (WS-BAND) TO LK-RATE
           STRING "B" WS-BAND DELIMITED BY SIZE INTO LK-CODE.
       4000-EXIT.
           EXIT.
      *----------------------------------------------------------------*
      * 5000 - ERA C, FROM 1 APRIL 2017. FIRST YEAR OR STANDARD RATE.  *
      *----------------------------------------------------------------*
       5000-ERA-C.
           IF FIRST-LICENCE
               EVALUATE TRUE
                   WHEN LK-CO2 NOT > 50   MOVE 1 TO WS-BAND
                   WHEN LK-CO2 NOT > 100  MOVE 2 TO WS-BAND
                   WHEN LK-CO2 NOT > 130  MOVE 3 TO WS-BAND
                   WHEN LK-CO2 NOT > 150  MOVE 4 TO WS-BAND
                   WHEN LK-CO2 NOT > 190  MOVE 5 TO WS-BAND
                   WHEN LK-CO2 NOT > 255  MOVE 6 TO WS-BAND
                   WHEN OTHER             MOVE 7 TO WS-BAND
               END-EVALUATE
               PERFORM 6000-DIESEL-UPLIFT THRU 6000-EXIT
               MOVE WS-FIRST-YEAR-RATE (WS-BAND) TO LK-RATE
               STRING "F" WS-BAND DELIMITED BY SIZE INTO LK-CODE
               GO TO 5000-EXIT
           END-IF
           MOVE WS-STANDARD-RATE TO LK-RATE
           MOVE "STD" TO LK-CODE
           IF LK-PRICE NOT > WS-SUPP-PRICE-MIN
               GO TO 5000-EXIT
           END-IF
           COMPUTE WS-FA-CCYY = WS-FR-CCYY + 5
           MOVE WS-FR-MMDD TO WS-FA-MMDD
           IF WS-FA-MMDD = 0229
               MOVE 0228 TO WS-FA-MMDD
           END-IF
           IF WS-LIC-START < WS-FIFTH-ANNIV
               ADD WS-SUPPLEMENT TO LK-RATE
               MOVE "STDS" TO LK-CODE
           END-IF.
       5000-EXIT.
           EXIT.
      *----------------------------------------------------------------*
      * 6000 - DIESEL MOVES UP ONE BAND, TO A MAXIMUM OF 7.            *
      *----------------------------------------------------------------*
       6000-DIESEL-UPLIFT.
           IF FUEL-DIESEL AND WS-BAND < 7
               ADD 1 TO WS-BAND
           END-IF.
       6000-EXIT.
           EXIT.
      *----------------------------------------------------------------*
      * 8000 - CONVERT DDMMYY TO CCYYMMDD AND CHECK IT IS A REAL DATE. *
      *        WINDOW: YY 50-99 IS 19YY, YY 00-49 IS 20YY.             *
      *----------------------------------------------------------------*
       8000-CONVERT-DATE.
           SET DATE-VALID TO TRUE
           MOVE ZERO TO WS-DATE-OUT
           IF WS-DATE-IN NOT NUMERIC
               SET DATE-INVALID TO TRUE
               GO TO 8000-EXIT
           END-IF
           IF WS-DI-YY < 50
               COMPUTE WS-DO-CCYY = 2000 + WS-DI-YY
           ELSE
               COMPUTE WS-DO-CCYY = 1900 + WS-DI-YY
           END-IF
           MOVE WS-DI-MM TO WS-DO-MM
           MOVE WS-DI-DD TO WS-DO-DD
           IF WS-DI-MM < 1 OR WS-DI-MM > 12
               SET DATE-INVALID TO TRUE
               GO TO 8000-EXIT
           END-IF
           MOVE WS-DAYS-IN-MONTH (WS-DI-MM) TO WS-MAX-DAY
           IF WS-DI-MM = 2
               DIVIDE WS-DO-CCYY BY 4 GIVING WS-QUOT
                   REMAINDER WS-REM4
               DIVIDE WS-DO-CCYY BY 100 GIVING WS-QUOT
                   REMAINDER WS-REM100
               DIVIDE WS-DO-CCYY BY 400 GIVING WS-QUOT
                   REMAINDER WS-REM400
               IF WS-REM400 = 0
                  OR (WS-REM4 = 0 AND WS-REM100 NOT = 0)
                   MOVE 29 TO WS-MAX-DAY
               END-IF
           END-IF
           IF WS-DI-DD < 1 OR WS-DI-DD > WS-MAX-DAY
               SET DATE-INVALID TO TRUE
           END-IF.
       8000-EXIT.
           EXIT.
